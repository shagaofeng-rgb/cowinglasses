import { count, desc, eq, max } from "drizzle-orm";
import Link from "next/link";
import { PageSizeSelect } from "@/components/admin/page-size-select";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { contentArticles, inventoryLevels, orders, payments, products, quoteRequests, syncJobs, trafficDailyRollups } from "@/db/schema";
import { getAdminPermissionCodes, requirePermission } from "@/lib/admin/auth";
import { getAdminPageHref, getAdminPagination } from "@/lib/admin/pagination";
import { googleSitemapJobType } from "@/lib/seo/google-sitemap-job";
import { SubmitSitemapForm } from "./submit-sitemap-form";

function when(value: Date | string | null | undefined) {
  if (!value) return "暂无记录";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "暂无记录" : `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
const statusLabel = { queued: "待执行", running: "运行中", succeeded: "成功", failed: "失败", cancelled: "已取消" };

export default async function SyncPage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
  const admin = await requirePermission("settings.read");
  const { page, pageSize, offset } = getAdminPagination(await searchParams);
  const db = getDatabase();
  const [catalogue, stock, order, payment, content, inquiry, rollup, google, jobs, total, permissions] = await Promise.all([
    db.select({ date: max(products.updatedAt) }).from(products),
    db.select({ date: max(inventoryLevels.updatedAt) }).from(inventoryLevels),
    db.select({ date: max(orders.updatedAt) }).from(orders),
    db.select({ date: max(payments.updatedAt) }).from(payments),
    db.select({ date: max(contentArticles.updatedAt) }).from(contentArticles).where(eq(contentArticles.status, "published")),
    db.select({ date: max(quoteRequests.updatedAt) }).from(quoteRequests),
    db.select({ date: max(trafficDailyRollups.updatedAt) }).from(trafficDailyRollups),
    db.select().from(syncJobs).where(eq(syncJobs.type, googleSitemapJobType)).orderBy(desc(syncJobs.createdAt)).limit(1),
    db.select().from(syncJobs).orderBy(desc(syncJobs.createdAt), desc(syncJobs.id)).limit(pageSize).offset(offset),
    db.select({ value: count() }).from(syncJobs),
    getAdminPermissionCodes(admin.id),
  ]);
  const tiles = [
    { label: "商品目录", date: catalogue[0].date, source: "数据库 · 更新后刷新前台目录", href: "/admin/products", permission: "catalog.read" },
    { label: "库存记录", date: stock[0].date, source: "实物盘点、预留及库存流水", href: "/admin/inventory", permission: "catalog.read" },
    { label: "订单状态", date: order[0].date, source: "商城下单及后台处理", href: "/admin/orders", permission: "orders.read" },
    { label: "支付记录", date: payment[0].date, source: "支付服务商回调及后台对账", href: "/admin/payments", permission: "orders.read" },
    { label: "已发布内容", date: content[0].date, source: "内容发布记录", href: "/admin/blog", permission: "customers.read" },
    { label: "采购询价", date: inquiry[0].date, source: "商城表单与跟进记录", href: "/admin/quotes", permission: "customers.read" },
    { label: "访问统计汇总", date: rollup[0].date, source: "每日 02:20 UTC 汇总", href: "/admin/analytics/traffic", permission: "analytics.read" },
  ];
  const latest = google[0];
  const readback = latest?.result?.readback as { lastSubmitted?: string; lastDownloaded?: string; isPending?: boolean } | null | undefined;
  return <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10">
    <p className="text-xs font-bold tracking-widest text-[#3e7230]">数据与系统</p>
    <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">数据同步</h1>
    <p className="mt-2 text-sm text-black/65">查看各业务最近记录时间、来源和任务回执。</p>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="业务数据更新时间">
      {tiles.filter((tile) => permissions.includes(tile.permission)).map((tile) => <Link key={tile.href} href={tile.href} className="rounded-2xl border border-black/10 bg-white p-5 hover:border-[#538a42]">
        <h2 className="font-bold">{tile.label}</h2><p className="mt-2 text-sm">{when(tile.date)}</p><p className="mt-1 text-xs text-black/60">{tile.source}</p>
      </Link>)}
    </section>
    <section className="mt-5 rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="text-xl font-bold">Google Search Console</h2>
      <p className="mt-2 text-sm text-black/65">每周一 09:00（北京时间）提交站点地图。</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-black/60">最新任务</dt><dd className="font-bold">{latest ? statusLabel[latest.status] : "暂无任务回执"}</dd></div>
        <div><dt className="text-black/60">任务结束</dt><dd>{when(latest?.finishedAt)}</dd></div>
        <div><dt className="text-black/60">Google 提交时间</dt><dd>{when(readback?.lastSubmitted)}</dd></div>
        <div><dt className="text-black/60">Google 读取时间</dt><dd>{when(readback?.lastDownloaded)}{readback?.isPending && " · 等待读取"}</dd></div>
      </dl>
      {latest?.errorMessage && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{latest.errorMessage}</p>}
      {permissions.includes("settings.manage") && <SubmitSitemapForm />}
    </section>
    <section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-5">
        <h2 className="font-serif text-xl font-bold">任务记录</h2>
        <form className="flex flex-wrap gap-2"><PageSizeSelect value={pageSize} /><button className="rounded-lg border border-black/15 px-3 text-sm font-bold">应用</button></form>
      </div>
      <div role="region" aria-label="任务记录" tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm [&_td]:p-4 [&_th]:p-4">
          <thead className="bg-[#f5f7f4]"><tr>{["类型 / 触发方式", "状态", "结束时间", "回执 / 异常"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{jobs.length ? jobs.map((job) => <tr key={job.id} className="border-t border-black/10">
            <td>{job.type === googleSitemapJobType ? "Google 站点地图" : job.type}<p className="text-xs text-black/65">{job.requestPayload?.trigger === "cron" ? "每周计划" : job.requestPayload?.trigger === "admin" ? "后台操作" : "—"}</p></td>
            <td className="font-semibold">{statusLabel[job.status]}</td><td>{when(job.finishedAt ?? job.createdAt)}</td>
            <td>{job.errorMessage || (typeof job.result?.httpStatus === "number" ? `HTTP ${job.result.httpStatus}` : "—")}</td>
          </tr>) : <tr><td colSpan={4} className="text-center text-black/60">任务执行后将显示结果。</td></tr>}</tbody>
        </table>
      </div>
      <TablePagination page={page} pageSize={pageSize} total={total[0].value} href={(next) => getAdminPageHref("/admin/sync", { pageSize: String(pageSize) }, next)} />
    </section>
  </div>;
}
