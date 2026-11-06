"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { auditLogs, inventoryLevels, inventoryMovements, productSkus } from "@/db/schema";
import { storeCatalogueTag } from "@/data/repositories/products";
import { requirePermission } from "@/lib/admin/auth";

const verification = z.object({
  skuId: z.string().uuid(),
  onHand: z.string().regex(/^\d{1,7}$/).transform(Number).pipe(z.number().max(1_000_000)),
  reorderPoint: z.string().regex(/^\d{1,7}$/).transform(Number).pipe(z.number().max(1_000_000)),
  reference: z.string().trim().min(3).max(200),
  confirm: z.literal("on"),
  mode: z.enum(["verify", "pause"]),
});

export async function saveStockCount(_previous: string, formData: FormData) {
  const admin = await requirePermission("catalog.update");
  const parsed = verification.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return "请填写盘点数量、记录编号或说明，并勾选确认。";
  const input = parsed.data;
  const now = new Date();

  try {
    const result = await getDatabase().transaction(async (tx) => {
      const [sku] = await tx.select({ id: productSkus.id, productId: productSkus.productId })
        .from(productSkus).where(eq(productSkus.id, input.skuId)).for("no key update");
      if (!sku) return "SKU 不存在。";

      const [level] = await tx.select().from(inventoryLevels).where(and(
        eq(inventoryLevels.skuId, sku.id), eq(inventoryLevels.locationCode, "default"),
      )).for("update");

      if (input.mode === "pause") {
        if (level) await tx.update(inventoryLevels).set({ verifiedAt: null, updatedAt: now }).where(eq(inventoryLevels.id, level.id));
      } else {
        if (input.onHand < (level?.reserved ?? 0)) return "盘点数量低于已预留数量。请先核对关联订单。";
        const values = { onHand: input.onHand, reorderPoint: input.reorderPoint, verifiedAt: now, updatedAt: now };
        if (level) await tx.update(inventoryLevels).set(values).where(eq(inventoryLevels.id, level.id));
        else await tx.insert(inventoryLevels).values({ skuId: sku.id, ...values });
      }
      const delta = input.mode === "verify" ? input.onHand - (level?.onHand ?? 0) : 0;
      await tx.insert(inventoryMovements).values({
        skuId: sku.id, type: level ? "adjustment" : "initial", quantityDelta: delta,
        referenceType: "stock_count", referenceId: sku.productId, operatorId: admin.id,
        note: `${input.mode === "verify" ? "确认实物盘点" : "暂停现货销售"} · ${input.reference}`,
      });
      await tx.insert(auditLogs).values({
        actorId: admin.id, action: `inventory.${input.mode}`, resourceType: "sku", resourceId: sku.id, result: "success",
        metadata: { reference: input.reference, onHand: input.mode === "verify" ? input.onHand : level?.onHand, delta },
      });
      return null;
    });
    if (result) return result;
    updateTag(storeCatalogueTag);
    updateTag("admin-operating-data");
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${input.skuId}`);
    return input.mode === "verify" ? "盘点已记录，已更新前台可售状态。" : "已暂停此仓位的现货销售。";
  } catch {
    return "库存更新失败，请重试或检查数据库状态。";
  }
}
