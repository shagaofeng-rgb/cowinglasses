import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { adminUsers, auditLogs } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { dateRangeQuery, getDateRange } from "@/lib/admin/date-range";
import { ADMIN_PAGE_SIZES, getAdminPagination } from "@/lib/admin/pagination";

type Search = { range?: string; from?: string; to?: string; page?: string; pageSize?: string; q?: string; result?: string };

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("settings.read");
  const input = await searchParams;
  const range = getDateRange(input);
  const { page, pageSize, offset } = getAdminPagination(input, 50);
  const q = input.q?.trim() ?? "";
  const result = ["success", "failure", "denied"].includes(input.result ?? "") ? input.result : undefined;
  const where = and(gte(auditLogs.createdAt, range.from), lte(auditLogs.createdAt, range.to), result ? eq(auditLogs.result, result) : undefined, q ? or(ilike(auditLogs.action, `%${q}%`), ilike(auditLogs.resourceType, `%${q}%`), ilike(adminUsers.email, `%${q}%`)) : undefined);
  const db = getDatabase();
  const [{ total }] = await db.select({ total: count() }).from(auditLogs).leftJoin(adminUsers, eq(auditLogs.actorId, adminUsers.id)).where(where);
  const rows = await db.select({ id: auditLogs.id, action: auditLogs.action, resourceType: auditLogs.resourceType, resourceId: auditLogs.resourceId, result: auditLogs.result, sourceIp: auditLogs.sourceIp, createdAt: auditLogs.createdAt, actor: adminUsers.name, email: adminUsers.email }).from(auditLogs).leftJoin(adminUsers, eq(auditLogs.actorId, adminUsers.id)).where(where).orderBy(desc(auditLogs.createdAt)).limit(pageSize).offset(offset);
  const href = (nextPage: number) => `/admin/audit-logs?${new URLSearchParams({ ...dateRangeQuery(range), ...(q ? { q } : {}), ...(result ? { result } : {}), pageSize: String(pageSize), page: String(nextPage) })}`;
  return <div className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10"><div className="border-b border-black/10 pb-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#538a42]">数据与系统</p><h1 className="mt-2 font-serif text-4xl font-bold">操作日志</h1><p className="mt-2 text-sm text-black/55">按时间、结果和关键字追溯后台与前台的真实服务端操作。</p></div><form className="mt-6 rounded-2xl border border-black/10 bg-white p-4"><div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_150px]"><input name="q" defaultValue={q} placeholder="操作、资源或管理员邮箱" className="rounded-xl border border-black/12 px-3 py-2.5"/><select name="result" defaultValue={result ?? ""} className="rounded-xl border border-black/12 bg-white px-3 py-2.5"><option value="">全部结果</option><option value="success">成功</option><option value="failure">失败</option><option value="denied">拒绝</option></select><label className="grid gap-1 text-xs font-semibold text-black/60">每页条数<select name="pageSize" defaultValue={pageSize} className="rounded-xl border border-black/12 bg-white px-3 py-2.5">{ADMIN_PAGE_SIZES.map((size) => <option key={size} value={size}>{size} 条</option>)}</select></label></div><DateRangeFilter range={range} className="mt-3"/><button className="mt-3 rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">查询日志</button></form><section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#f5f7f4] text-xs uppercase tracking-wide text-black/52"><tr><th className="px-5 py-4">时间</th><th className="px-5 py-4">操作人</th><th className="px-5 py-4">动作</th><th className="px-5 py-4">资源</th><th className="px-5 py-4">来源</th><th className="px-5 py-4">结果</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id} className="border-t border-black/8"><td className="px-5 py-4 text-black/55">{row.createdAt.toLocaleString("zh-CN")}</td><td className="px-5 py-4"><p className="font-semibold">{row.actor ?? "系统 / 前台"}</p><p className="mt-1 text-xs text-black/50">{row.email ?? "—"}</p></td><td className="px-5 py-4 font-mono text-xs">{row.action}</td><td className="px-5 py-4 text-xs">{row.resourceType} {row.resourceId ?? ""}</td><td className="px-5 py-4 text-black/55">{row.sourceIp ?? "—"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.result === "success" ? "bg-[#edf4e9] text-[#3e752e]" : row.result === "denied" ? "bg-[#fff4df] text-[#9a5a00]" : "bg-red-50 text-red-700"}`}>{row.result}</span></td></tr>) : <tr><td colSpan={6} className="px-5 py-14 text-center text-black/55">当前筛选条件下暂无操作日志。</td></tr>}</tbody></table></div><TablePagination page={page} pageSize={pageSize} total={Number(total)} href={href}/></section></div>;
}
