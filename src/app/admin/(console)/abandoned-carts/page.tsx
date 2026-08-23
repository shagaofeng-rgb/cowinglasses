import { and, asc, gte, lte } from "drizzle-orm";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { getDatabase } from "@/db/client";
import { storefrontEvents } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getDateRange } from "@/lib/admin/date-range";

type CartSession = { sessionId: string; firstAt: Date; lastAt: Date; productIds: Set<string>; beganCheckout: boolean; createdOrder: boolean };

export default async function AbandonedCartsPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  await requirePermission("customers.read");
  const range = getDateRange(await searchParams);
  const events = await getDatabase().select({ sessionId: storefrontEvents.sessionId, eventName: storefrontEvents.eventName, productId: storefrontEvents.productId, createdAt: storefrontEvents.createdAt }).from(storefrontEvents).where(and(gte(storefrontEvents.createdAt, range.from), lte(storefrontEvents.createdAt, range.to))).orderBy(asc(storefrontEvents.createdAt)).limit(10000);
  const sessions = new Map<string, CartSession>();
  for (const event of events) {
    if (!event.sessionId) continue;
    const row = sessions.get(event.sessionId) ?? { sessionId: event.sessionId, firstAt: event.createdAt, lastAt: event.createdAt, productIds: new Set<string>(), beganCheckout: false, createdOrder: false };
    row.lastAt = event.createdAt;
    if (event.eventName === "add_to_cart" && event.productId) row.productIds.add(event.productId);
    if (event.eventName === "begin_checkout") row.beganCheckout = true;
    if (event.eventName === "order_created") row.createdOrder = true;
    sessions.set(event.sessionId, row);
  }
  const abandoned = [...sessions.values()].filter((row) => row.productIds.size > 0 && !row.createdOrder).sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">购物车与弃购</h1><p className="mt-2 text-sm text-black/55">依据前台第一方加购、结账和订单事件识别未完成订单的会话；未保存或展示客户未授权的联系方式。</p><form className="mt-5 rounded-2xl border border-black/10 bg-white p-4"><DateRangeFilter range={range}/><button className="mt-3 rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">更新弃购数据</button></form><div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="发生加购的会话" value={[...sessions.values()].filter((row) => row.productIds.size > 0).length}/><Metric label="弃购会话" value={abandoned.length}/><Metric label="已开始结账但未下单" value={abandoned.filter((row) => row.beganCheckout).length}/></div><section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f5f7f4]"><tr><th className="p-4">会话</th><th className="p-4">加购商品数</th><th className="p-4">结账状态</th><th className="p-4">最后活动</th></tr></thead><tbody>{abandoned.length ? abandoned.slice(0, 200).map((row) => <tr key={row.sessionId} className="border-t border-black/8"><td className="p-4 font-mono text-xs">{row.sessionId.slice(0, 18)}…</td><td className="p-4">{row.productIds.size}</td><td className="p-4">{row.beganCheckout ? "已开始结账" : "停留在购物车"}</td><td className="p-4 text-black/55">{row.lastAt.toLocaleString("zh-CN")}</td></tr>) : <tr><td colSpan={4} className="p-14 text-center text-black/55">当前日期范围内没有可识别的弃购会话。</td></tr>}</tbody></table></section></main>;
}
function Metric({ label, value }: { label: string; value: number }) { return <article className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-sm text-black/55">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></article>; }
