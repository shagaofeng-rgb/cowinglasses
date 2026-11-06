import { and, asc, count, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import Link from "next/link";
import { PageSizeSelect } from "@/components/admin/page-size-select";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { inventoryLevels, products, productSkus } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminPageHref, getAdminPagination } from "@/lib/admin/pagination";

type Search = { q?: string; status?: string; page?: string; pageSize?: string };
const statuses = { pending: "待核实", sellable: "可售", empty: "已核实 · 无可售库存" };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("catalog.read");
  const query = await searchParams;
  const { page, pageSize, offset } = getAdminPagination(query, 25);
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 120) : "";
  const status = typeof query.status === "string" ? query.status : "";
  const db = getDatabase();
  const location = and(eq(inventoryLevels.skuId, productSkus.id), eq(inventoryLevels.locationCode, "default"));
  const available = sql`${inventoryLevels.onHand} - ${inventoryLevels.reserved}`;
  const where = and(
    eq(productSkus.isActive, true), eq(products.status, "active"),
    q ? or(ilike(products.name, `%${q}%`), ilike(productSkus.sku, `%${q}%`)) : undefined,
    status === "pending" ? isNull(inventoryLevels.verifiedAt) :
      status === "sellable" ? and(isNotNull(inventoryLevels.verifiedAt), sql`${available} > 0`) :
      status === "empty" ? and(isNotNull(inventoryLevels.verifiedAt), sql`${available} <= 0`) : undefined,
  );
  const [totals, rows] = await Promise.all([
    db.select({ total: count() }).from(productSkus).innerJoin(products, eq(productSkus.productId, products.id))
      .leftJoin(inventoryLevels, location).where(where),
    db.select({ skuId: productSkus.id, product: products.name, sku: productSkus.sku, level: inventoryLevels })
      .from(productSkus).innerJoin(products, eq(productSkus.productId, products.id)).leftJoin(inventoryLevels, location)
      .where(where).orderBy(asc(sql`${inventoryLevels.verifiedAt} is not null`), asc(productSkus.sku)).limit(pageSize).offset(offset),
  ]);
  const href = (next: number) => getAdminPageHref("/admin/inventory", { q, status, pageSize: String(pageSize) }, next);

  return <div className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-7">
      <div><p className="text-xs font-bold tracking-widest text-[#3e7230]">商品</p><h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">库存管理</h1>
        <p className="mt-2 text-sm text-black/65">默认仓 · 确认实物盘点后开放付款。可售数量为现有库存减去已预留数量。</p></div>
      <Link href="/admin/inventory-ledger" className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-bold">查看库存流水</Link>
    </div>
    <form className="mt-6 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_170px_135px_auto]">
      <input name="q" defaultValue={q} aria-label="搜索商品或 SKU" placeholder="搜索商品或 SKU" className="min-w-0 rounded-xl border border-black/15 px-3 py-2.5" />
      <select name="status" defaultValue={status} aria-label="库存状态" className="min-w-0 rounded-xl border border-black/15 bg-white px-3 py-2.5">
        <option value="">全部库存状态</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <PageSizeSelect value={pageSize} /><button className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-bold">筛选</button>
    </form>
    <section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="relative max-w-full overflow-x-auto [contain:inline-size]" role="region" aria-label="SKU 库存列表" tabIndex={0}>
        <table className="w-full min-w-[720px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3">
          <thead className="bg-[#f5f7f4] text-xs text-black/65"><tr>{["商品 / SKU", "库存状态", "实物", "已预留", "可售", "确认日期", "操作"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{rows.length ? rows.map(({ level, skuId, product, sku }) => {
            const sellable = level?.verifiedAt ? Math.max(0, level.onHand - level.reserved) : 0;
            return <tr key={skuId} className="border-t border-black/10">
              <td><p className="font-bold">{product}</p><p className="font-mono text-xs text-black/60">{sku}</p></td>
              <td className="font-semibold">{!level ? "缺库存记录" : !level.verifiedAt ? statuses.pending : sellable ? statuses.sellable : statuses.empty}</td>
              <td>{level?.onHand ?? "—"}</td><td>{level?.reserved ?? "—"}</td><td>{sellable}</td>
              <td>{level?.verifiedAt?.toISOString().slice(0, 10) ?? "—"}</td>
              <td><Link href={`/admin/inventory/${skuId}`} className="font-bold text-[#3e7230]">核对 <span className="sr-only">{sku}</span></Link></td>
            </tr>;
          }) : <tr><td colSpan={7} className="text-center text-black/60">当前筛选下没有启用的 SKU。</td></tr>}</tbody>
        </table>
      </div>
      <TablePagination page={page} pageSize={pageSize} total={totals[0].total} href={href} label="个 SKU" />
    </section>
  </div>;
}
