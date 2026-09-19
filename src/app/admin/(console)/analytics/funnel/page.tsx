import { and, gte, inArray, lte, sql } from "drizzle-orm";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { getDatabase } from "@/db/client";
import { storefrontEvents } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getDateRange } from "@/lib/admin/date-range";

const steps = [["浏览页面", "page_view"], ["浏览商品", "product_view"], ["加入购物车", "add_to_cart"], ["开始结算", "begin_checkout"], ["创建订单", "order_created"]] as const;

export default async function FunnelPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  await requirePermission("analytics.read");
  const range = getDateRange(await searchParams);
  const rows = await getDatabase().select({ name: storefrontEvents.eventName, total: sql<number>`count(*)` }).from(storefrontEvents).where(and(gte(storefrontEvents.createdAt, range.from), lte(storefrontEvents.createdAt, range.to), inArray(storefrontEvents.eventName, steps.map(([, name]) => name)))).groupBy(storefrontEvents.eventName);
  const totals = new Map(rows.map((row) => [row.name, Number(row.total)]));
  const base = totals.get("page_view") || 1;
  return <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">转化漏斗</h1><p className="mt-2 text-sm text-black/55">{range.from.toLocaleDateString("zh-CN")} 至 {range.to.toLocaleDateString("zh-CN")}，按照前台真实事件统计。</p><form className="mt-5 rounded-2xl border border-black/10 bg-white p-4"><DateRangeFilter range={range} /><button className="mt-3 rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">筛选漏斗</button></form><div className="mt-6 grid gap-4">{steps.map(([label, name]) => { const total = totals.get(name) || 0; return <div key={name} className="rounded-2xl border border-black/10 bg-white p-5"><div className="flex justify-between"><strong>{label}</strong><strong>{total}</strong></div><div className="mt-3 h-3 rounded-full bg-[#edf0eb]"><div className="h-3 rounded-full bg-[#a6c947]" style={{ width: `${Math.min(100, total / base * 100)}%` }} /></div><p className="mt-2 text-xs text-black/50">相对页面浏览 {((total / base) * 100).toFixed(2)}%</p></div>; })}</div></main>;
}
