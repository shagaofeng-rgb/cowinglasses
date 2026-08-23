import { count, desc } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { contentArticles, orders, products, storefrontEvents, syncJobs } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";

export default async function SyncPage() {
  await requirePermission("settings.read");
  const db = getDatabase();
  const [productCount, orderCount, contentCount, eventCount, jobs] = await Promise.all([db.select({ value: count() }).from(products), db.select({ value: count() }).from(orders), db.select({ value: count() }).from(contentArticles), db.select({ value: count() }).from(storefrontEvents), db.select().from(syncJobs).orderBy(desc(syncJobs.createdAt)).limit(50)]);
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">数据同步</h1><p className="mt-2 text-sm text-black/55">前台商品、订单、内容、客户事件已直接使用 Neon 主数据库，无需通过第三方渠道同步。渠道连接尚未授权时不会创建伪造同步任务。</p><div className="mt-6 grid gap-4 sm:grid-cols-4"><Metric label="商品记录" value={productCount[0]?.value ?? 0}/><Metric label="订单记录" value={orderCount[0]?.value ?? 0}/><Metric label="内容记录" value={contentCount[0]?.value ?? 0}/><Metric label="前台事件" value={eventCount[0]?.value ?? 0}/></div><section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white"><h2 className="border-b border-black/8 p-5 font-serif text-2xl font-bold">同步任务记录</h2><table className="w-full text-left text-sm"><thead className="bg-[#f5f7f4]"><tr><th className="p-4">类型</th><th className="p-4">状态</th><th className="p-4">创建时间</th><th className="p-4">结果</th></tr></thead><tbody>{jobs.length ? jobs.map((job) => <tr key={job.id} className="border-t border-black/8"><td className="p-4">{job.type}</td><td className="p-4">{job.status}</td><td className="p-4 text-black/55">{job.createdAt.toLocaleString("zh-CN")}</td><td className="p-4 text-black/55">{job.errorMessage || "—"}</td></tr>) : <tr><td colSpan={4} className="p-14 text-center text-black/55">暂无外部同步任务。连接渠道后才会显示同步历史。</td></tr>}</tbody></table></section></main>;
}
function Metric({ label, value }: { label: string; value: number }) { return <article className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-sm text-black/55">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></article>; }
