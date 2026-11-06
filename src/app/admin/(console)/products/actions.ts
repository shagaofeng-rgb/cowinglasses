"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { writeAuditLog } from "@/lib/admin/audit";
import { requirePermission } from "@/lib/admin/auth";
import { getDatabase } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { products, productSkus } from "@/db/schema";
import { storeCatalogueTag } from "@/data/repositories/products";

const productFormSchema = z.object({ name: z.string().trim().min(2, "请填写至少 2 个字符的商品名称。").max(240), slug: z.string().trim().min(2, "请填写商品 Slug。").max(260).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 仅支持小写英文、数字和连字符。"), description: z.string().trim().max(10000).optional(), sku: z.string().trim().min(2, "请填写 SKU。").max(128), price: z.string().regex(/^\d+(\.\d{1,2})?$/, "价格格式不正确。"), status: z.enum(["draft", "active"]) });
export type ProductFormState = { success: boolean; message: string };
const productUpdateSchema = z.object({ productId: z.string().uuid(), skuId: z.string().uuid(), name: z.string().trim().min(2).max(240), slug: z.string().trim().min(2).max(260).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), shortDescription: z.string().trim().max(500).optional(), description: z.string().trim().max(10000).optional(), seoTitle: z.string().trim().max(255).optional(), seoDescription: z.string().trim().max(320).optional(), price: z.string().regex(/^\d+(\.\d{1,2})?$/), compareAtPrice: z.union([z.literal(""), z.string().regex(/^\d+(\.\d{1,2})?$/)]), status: z.enum(["draft", "active", "archived"]) });

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
      return [createdProduct];
    });
    updateTag(storeCatalogueTag);
    await writeAuditLog({ actorId: administrator.id, action: "catalog.product.create", resourceType: "product", resourceId: product.id, result: "success", metadata: { sku: input.sku, status: input.status } });
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { success: true, message: "商品与 SKU 已创建。完成库存盘点后可开放销售。" };
  } catch (error) {
    console.error("创建商品失败", error);
    await writeAuditLog({ actorId: administrator.id, action: "catalog.product.create", resourceType: "product", result: "failure" });
    return { success: false, message: "创建失败。请确认 Slug 和 SKU 未重复，再重试。" };
  }
}

export async function updateProductAction(_state: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const administrator = await requirePermission("catalog.update");
  const parsed = productUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "商品信息不完整。" };
  try {
    const input = parsed.data;
    await getDatabase().transaction(async (transaction) => {
      await transaction.update(products).set({ name: input.name, slug: input.slug, shortDescription: input.shortDescription || null, description: input.description || null, seoTitle: input.seoTitle || null, seoDescription: input.seoDescription || null, status: input.status, publishedAt: input.status === "active" ? new Date() : null, updatedAt: new Date() }).where(eq(products.id, input.productId));
      const [sku] = await transaction.update(productSkus)
        .set({ price: input.price, compareAtPrice: input.compareAtPrice || null, updatedAt: new Date() })
        .where(and(eq(productSkus.id, input.skuId), eq(productSkus.productId, input.productId)))
        .returning({ id: productSkus.id });
      if (!sku) throw new Error("SKU does not belong to the selected product.");
    });
    updateTag(storeCatalogueTag);
    await writeAuditLog({ actorId: administrator.id, action: "catalog.product.update", resourceType: "product", resourceId: input.productId, result: "success", metadata: { skuId: input.skuId, status: input.status } });
    revalidatePath("/", "layout");
    revalidatePath("/admin/products");
    return { success: true, message: "商品与价格已保存，并已同步到前台。" };
  } catch (error) {
    console.error("更新商品失败", error);
    await writeAuditLog({ actorId: administrator.id, action: "catalog.product.update", resourceType: "product", result: "failure" });
    return { success: false, message: "保存失败。请检查 Slug、SKU 与输入数据。" };
  }
}
