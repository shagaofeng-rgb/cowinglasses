"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAuditLog } from "@/lib/admin/audit";
import { requirePermission } from "@/lib/admin/auth";
import { getDatabase } from "@/db/client";
import { inventoryLevels, products, productSkus } from "@/db/schema";

const productFormSchema = z.object({ name: z.string().trim().min(2, "请填写至少 2 个字符的商品名称。").max(240), slug: z.string().trim().min(2, "请填写商品 Slug。").max(260).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 仅支持小写英文、数字和连字符。"), description: z.string().trim().max(10000).optional(), sku: z.string().trim().min(2, "请填写 SKU。").max(128), price: z.string().regex(/^\d+(\.\d{1,2})?$/, "价格格式不正确。"), inventory: z.coerce.number().int().min(0, "库存不能小于 0。").max(1000000), status: z.enum(["draft", "active"]) });
export type ProductFormState = { success: boolean; message: string };
export const initialProductFormState: ProductFormState = { success: false, message: "" };

export async function createProductAction(_state: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const administrator = await requirePermission("catalog.create");
  const parsed = productFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "商品信息不完整。" };
  try {
    const input = parsed.data;
    const [product] = await getDatabase().transaction(async (transaction) => {
      const created = await transaction.insert(products).values({ name: input.name, slug: input.slug, description: input.description || null, status: input.status, publishedAt: input.status === "active" ? new Date() : null }).returning();
      const createdProduct = created[0]; if (!createdProduct) throw new Error("商品创建失败。");
      const skus = await transaction.insert(productSkus).values({ productId: createdProduct.id, sku: input.sku, price: input.price }).returning();
      const sku = skus[0]; if (!sku) throw new Error("SKU 创建失败。");
      await transaction.insert(inventoryLevels).values({ skuId: sku.id, onHand: input.inventory, reorderPoint: 0 });
      return [createdProduct];
    });
    await writeAuditLog({ actorId: administrator.id, action: "catalog.product.create", resourceType: "product", resourceId: product.id, result: "success", metadata: { sku: input.sku, status: input.status } });
    revalidatePath("/admin/products");
    return { success: true, message: "商品、SKU 与初始库存已创建。" };
  } catch (error) {
    console.error("创建商品失败", error);
    await writeAuditLog({ actorId: administrator.id, action: "catalog.product.create", resourceType: "product", result: "failure" });
    return { success: false, message: "创建失败。请确认 Slug 和 SKU 未重复，再重试。" };
  }
}
