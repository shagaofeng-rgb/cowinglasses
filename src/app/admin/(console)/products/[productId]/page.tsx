import Link from "next/link";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductEditForm } from "@/app/admin/(console)/products/[productId]/product-edit-form";
import { requirePermission } from "@/lib/admin/auth";
import { getDatabase } from "@/db/client";
import { products, productSkus } from "@/db/schema";

export default async function ProductEditPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: Promise<{ sku?: string }> }) {
  await requirePermission("catalog.read");
  const { productId } = await params;
  if (!z.string().uuid().safeParse(productId).success) notFound();
  const db = getDatabase();
  const product = (await db.select().from(products).where(eq(products.id, productId)).limit(1))[0];
  if (!product) notFound();
  const variants = await db.select().from(productSkus).where(eq(productSkus.productId, product.id)).orderBy(asc(productSkus.sku));
  const selected = (await searchParams).sku;
  const sku = variants.find((item) => item.id === selected) ?? variants[0];
  if (!sku) notFound();
  return <div className="mx-auto max-w-[1120px] px-5 py-7 sm:px-8 lg:px-10"><Link href="/admin/products" className="text-sm font-bold text-[#4e7f3f]">← 返回商品管理</Link><div className="mt-6 border-b border-black/10 pb-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#538a42]">商品与库存</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em]">编辑商品</h1><p className="mt-2 text-sm text-black/55">对商品、价格与 SEO 的修改会同步前台并记录审计日志。</p></div><div className="mt-5 flex flex-wrap items-center gap-2" aria-label="选择 SKU">{variants.map((variant) => <Link key={variant.id} href={`?sku=${variant.id}`} aria-current={sku.id === variant.id ? "page" : undefined} className="rounded-lg border border-black/15 px-3 py-2 text-sm aria-[current=page]:bg-[#e7efdf]">{variant.sku}</Link>)}<Link className="ms-auto text-sm font-bold text-[#3e7230]" href={`/admin/inventory/${sku.id}`}>核对该 SKU 库存</Link></div><ProductEditForm key={sku.id} product={{ id: product.id, skuId: sku.id, name: product.name, slug: product.slug, shortDescription: product.shortDescription ?? "", description: product.description ?? "", seoTitle: product.seoTitle ?? "", seoDescription: product.seoDescription ?? "", price: sku.price, compareAtPrice: sku.compareAtPrice ?? "", status: product.status }} /></div>;
}
