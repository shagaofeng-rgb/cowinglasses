import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductEditForm } from "@/app/admin/(console)/products/[productId]/product-edit-form";
import { requirePermission } from "@/lib/admin/auth";
import { getDatabase } from "@/db/client";
import { inventoryLevels, products, productSkus } from "@/db/schema";

export default async function ProductEditPage({ params }: { params: Promise<{ productId: string }> }) {
  await requirePermission("catalog.read");
  const { productId } = await params;
  const db = getDatabase();
  const product = (await db.select().from(products).where(eq(products.id, productId)).limit(1))[0];
  if (!product) notFound();
  const sku = (await db.select().from(productSkus).where(eq(productSkus.productId, product.id)).limit(1))[0];
  if (!sku) notFound();
  const inventory = (await db.select().from(inventoryLevels).where(eq(inventoryLevels.skuId, sku.id)).limit(1))[0];
  return <div className="mx-auto max-w-[1120px] px-5 py-7 sm:px-8 lg:px-10"><Link href="/admin/products" className="text-sm font-bold text-[#4e7f3f]">← 返回商品管理</Link><div className="mt-6 border-b border-black/10 pb-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#538a42]">商品与库存</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em]">编辑商品</h1><p className="mt-2 text-sm text-black/55">对商品、价格、库存与 SEO 的修改会同步前台并记录审计日志。</p></div><ProductEditForm product={{ id: product.id, skuId: sku.id, name: product.name, slug: product.slug, shortDescription: product.shortDescription ?? "", description: product.description ?? "", seoTitle: product.seoTitle ?? "", seoDescription: product.seoDescription ?? "", price: sku.price, compareAtPrice: sku.compareAtPrice ?? "", onHand: inventory?.onHand ?? 0, reorderPoint: inventory?.reorderPoint ?? 0, status: product.status }} /></div>;
}
