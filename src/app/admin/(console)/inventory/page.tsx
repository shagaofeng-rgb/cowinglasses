import { count, desc, eq, ilike, or } from "drizzle-orm";
import Link from "next/link";
import { PageSizeSelect } from "@/components/admin/page-size-select";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { inventoryLevels, products, productSkus } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminPageHref, getAdminPagination } from "@/lib/admin/pagination";

type Search = { q?: string; page?: string; pageSize?: string };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("catalog.read");
  const query = await searchParams;
  const { page, pageSize, offset } = getAdminPagination(query, 25);
  const q = query.q?.trim() ?? "";
  const db = getDatabase();
  const where = q ? or(ilike(products.name, `%${q}%`), ilike(productSkus.sku, `%${q}%`)) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(inventoryLevels).innerJoin(productSkus, eq(inventoryLevels.skuId, productSkus.id)).innerJoin(products, eq(productSkus.productId, products.id)).where(where);
  const rows = await db.select({ productId: products.id, product: products.name, sku: productSkus.sku, onHand: inventoryLevels.onHand, reserved: inventoryLevels.reserved, reorderPoint: inventoryLevels.reorderPoint, updatedAt: inventoryLevels.updatedAt }).from(inventoryLevels).innerJoin(productSkus, eq(inventoryLevels.skuId, productSkus.id)).innerJoin(products, eq(productSkus.productId, products.id)).where(where).orderBy(desc(inventoryLevels.updatedAt)).limit(pageSize).offset(offset);
  const href = (nextPage: number) => getAdminPageHref("/admin/inventory", { q, pageSize: String(pageSize) }, nextPage);

  return <div className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10"><div className="flex items-end justify-between border-b border-black/10 pb-7"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#538a42]">商品</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">库存管理</h1><p className="mt-2 text-sm text-black/55">可售库存 = 现有库存 - 已预留库存。调整库存请进入对应商品编辑页。</p></div><Link href="/admin/inventory-ledger" className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-bold">查看库存流水</Link></div><form className="mt-6 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_150px_auto]"><input name="q" defaultValue={q} placeholder="搜索商品或 SKU" className="rounded-xl border border-black/12 px-3 py-2.5"/><PageSizeSelect value={pageSize}/><button className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-bold">筛选</button></form><section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#f5f7f4] text-xs uppercase tracking-wide text-black/52"><tr><th className="px-5 py-4">商品 / SKU</th><th className="px-5 py-4">现有库存</th><th className="px-5 py-4">已预留</th><th className="px-5 py-4">可售</th><th className="px-5 py-4">预警阈值</th><th className="px-5 py-4">更新时间</th><th className="px-5 py-4">操作</th></tr></thead><tbody>{rows.length ? rows.map((row) => { const available = row.onHand - row.reserved; const low = available <= row.reorderPoint; return <tr key={row.sku} className="border-t border-black/8"><td className="px-5 py-4"><p className="font-bold">{row.product}</p><p className="mt-1 font-mono text-xs text-black/50">{row.sku}</p></td><td className="px-5 py-4">{row.onHand}</td><td className="px-5 py-4">{row.reserved}</td><td className={`px-5 py-4 font-bold ${low ? "text-[#b05a00]" : ""}`}>{available}</td><td className="px-5 py-4">{row.reorderPoint}</td><td className="px-5 py-4 text-black/55">{row.updatedAt.toLocaleString("zh-CN")}</td><td className="px-5 py-4"><Link href={`/admin/products/${row.productId}`} className="rounded-lg border border-black/15 px-3 py-2 text-xs font-bold">调整</Link></td></tr>; }) : <tr><td colSpan={7} className="px-5 py-16 text-center text-black/55">暂无已配置库存。请在商品编辑页填写库存和预警阈值。</td></tr>}</tbody></table></div><TablePagination page={page} pageSize={pageSize} total={Number(total)} href={href} label="个 SKU"/></section></div>;
}
