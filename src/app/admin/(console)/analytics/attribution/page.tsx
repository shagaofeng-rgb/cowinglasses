import { and, desc, gte, lte, sql } from "drizzle-orm";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { getDatabase } from "@/db/client";
import { orderAttributions, orders, webSessions } from "@/db/schema";
import { getDateRange } from "@/lib/admin/date-range";
import { requirePermission } from "@/lib/admin/auth";

export default async function AttributionPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  await requirePermission("analytics.read");
  const range = getDateRange(await searchParams);
  const db = getDatabase();
  const [sessions, attributedOrders] = await Promise.all([
    db.select({ source: webSessions.source, medium: webSessions.medium, campaign: webSessions.campaign, sessions: sql<string>`count(*)`, visitors: sql<string>`count(distinct ${webSessions.visitorId})` }).from(webSessions).where(and(gte(webSessions.startedAt, range.from), lte(webSessions.startedAt, range.to))).groupBy(webSessions.source, webSessions.medium, webSessions.campaign).orderBy(desc(sql`count(*)`)).limit(100),
    db.select({ source: orderAttributions.lastSource, medium: orderAttributions.lastMedium, campaign: orderAttributions.lastCampaign, orders: sql<string>`count(*)`, sales: sql<string>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.totalAmount} else 0 end), 0)` }).from(orderAttributions).innerJoin(orders, sql`${orderAttributions.orderId} = ${orders.id}`).where(and(gte(orders.createdAt, range.from), lte(orders.createdAt, range.to))).groupBy(orderAttributions.lastSource, orderAttributions.lastMedium, orderAttributions.lastCampaign),
  ]);
  const ordersBySource = new Map(attributedOrders.map((row) => [`${row.source ?? "direct"}|${row.medium ?? "none"}|${row.campaign ?? ""}`, row]));
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">来源归因</h1><p className="mt-2 text-sm text-black/55">按 UTM 优先、来源域名兜底的首次/最后触点规则统计。订单归因自本次更新后开始完整沉淀。</p><form className="mt-5 rounded-2xl border border-black/10 bg-white p-4"><DateRangeFilter range={range}/><button className="mt-3 rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">筛选归因</button></form><section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#f5f7f4]"><tr><th className="p-4">来源 / 媒介 / 活动</th><th className="p-4">会话</th><th className="p-4">访客</th><th className="p-4">创建订单</th><th className="p-4">已付款销售额</th><th className="p-4">会话转化率</th></tr></thead><tbody>{sessions.length ? sessions.map((row) => { const key = `${row.source ?? "direct"}|${row.medium ?? "none"}|${row.campaign ?? ""}`; const order = ordersBySource.get(key); const sessionCount = Number(row.sessions); return <tr key={key} className="border-t border-black/8"><td className="p-4"><strong>{row.source ?? "direct"} / {row.medium ?? "none"}</strong>{row.campaign && <p className="mt-1 text-xs text-black/55">Campaign: {row.campaign}</p>}</td><td className="p-4">{sessionCount}</td><td className="p-4">{row.visitors}</td><td className="p-4">{Number(order?.orders ?? 0)}</td><td className="p-4">USD {Number(order?.sales ?? 0).toFixed(2)}</td><td className="p-4">{sessionCount ? `${(Number(order?.orders ?? 0) / sessionCount * 100).toFixed(2)}%` : "—"}</td></tr>; }) : <tr><td colSpan={6} className="p-12 text-center text-black/55">当前日期范围内暂无可用来源会话。</td></tr>}</tbody></table></section></main>;
}
