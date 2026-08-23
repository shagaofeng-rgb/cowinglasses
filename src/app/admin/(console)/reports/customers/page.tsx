import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { getDatabase } from "@/db/client";
import { customers, orders } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getDateRange } from "@/lib/admin/date-range";

export default async function CustomerReportPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  await requirePermission("analytics.read");
  const range = getDateRange(await searchParams);
  const db = getDatabase();
  const [newCustomers, marketingCustomers, sources, topCustomers] = await Promise.all([
    db.select({ value: count() }).from(customers).where(and(gte(customers.createdAt, range.from), lte(customers.createdAt, range.to))),
    db.select({ value: count() }).from(customers).where(and(gte(customers.createdAt, range.from), lte(customers.createdAt, range.to), eq(customers.acceptsMarketing, true))),
    db.select({ source: customers.source, customers: count(), sales: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` }).from(customers).leftJoin(orders, eq(orders.customerId, customers.id)).where(and(gte(customers.createdAt, range.from), lte(customers.createdAt, range.to))).groupBy(customers.source).orderBy(desc(count())).limit(20),
    db.select({ id: customers.id, name: sql<string>`coalesce(nullif(trim(concat_ws(' ', ${customers.firstName}, ${customers.lastName})), ''), ${customers.email}, '未命名客户')`, email: customers.email, orders: count(orders.id), spent: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` }).from(customers).leftJoin(orders, eq(orders.customerId, customers.id)).groupBy(customers.id).orderBy(desc(sql`coalesce(sum(${orders.totalAmount}), 0)`)).limit(20),
  ]);
  const totalSales = topCustomers.reduce((sum, row) => sum + Number(row.spent), 0);
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">客户分析</h1><p className="mt-2 text-sm text-black/55">基于前台订单和客户档案的真实增长、来源及客户价值数据。</p><form className="mt-5 rounded-2xl border border-black/10 bg-white p-4"><DateRangeFilter range={range}/><button className="mt-3 rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">更新报表</button></form><div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="新增客户" value={newCustomers[0]?.value ?? 0}/><Metric label="营销订阅" value={marketingCustomers[0]?.value ?? 0}/><Metric label="Top 20 客户累计销售额" value={`USD ${totalSales.toFixed(2)}`}/></div><section className="mt-6 grid gap-6 lg:grid-cols-2"><Table title="客户来源" columns={["来源", "客户数", "订单销售额"]} rows={sources.map((row) => [row.source || "直接访问 / 未归因", String(row.customers), `USD ${Number(row.sales).toFixed(2)}`])} empty="该时段暂无新增客户。"/><Table title="高价值客户" columns={["客户", "订单", "累计消费"]} rows={topCustomers.map((row) => [`${row.name}${row.email ? ` · ${row.email}` : ""}`, String(row.orders), `USD ${Number(row.spent).toFixed(2)}`])} empty="暂无客户订单数据。"/></section></main>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <article className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-sm text-black/55">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></article>; }
function Table({ title, columns, rows, empty }: { title: string; columns: string[]; rows: string[][]; empty: string }) { return <section className="overflow-hidden rounded-2xl border border-black/10 bg-white"><h2 className="border-b border-black/8 px-5 py-4 font-serif text-2xl font-bold">{title}</h2><div className="overflow-x-auto"><table className="w-full min-w-[440px] text-left text-sm"><thead className="bg-[#f5f7f4]"><tr>{columns.map((column) => <th key={column} className="p-4">{column}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index} className="border-t border-black/8">{row.map((cell, cellIndex) => <td key={cellIndex} className="p-4">{cell}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-10 text-center text-black/55">{empty}</td></tr>}</tbody></table></div></section>; }
