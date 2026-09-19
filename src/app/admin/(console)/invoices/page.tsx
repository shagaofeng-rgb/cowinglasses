import { and, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import Link from "next/link";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { PageSizeSelect } from "@/components/admin/page-size-select";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { customers, orders } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { dateRangeQuery, getDateRange } from "@/lib/admin/date-range";
import { getAdminPageHref, getAdminPagination } from "@/lib/admin/pagination";

type Search = { range?: string; from?: string; to?: string; page?: string; pageSize?: string };

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("orders.read");
  const query = await searchParams;
  const range = getDateRange(query);
  const { page, pageSize, offset } = getAdminPagination(query, 25);
  const db = getDatabase();
  const where = and(gte(orders.createdAt, range.from), lte(orders.createdAt, range.to), inArray(orders.status, ["pending_payment", "paid", "processing", "partially_shipped", "shipped", "delivered", "refunded"]));
  const [{ total }] = await db.select({ total: count() }).from(orders).where(where);
  const rows = await db.select({ id: orders.id, orderNumber: orders.orderNumber, status: orders.status, paymentStatus: orders.paymentStatus, total: orders.totalAmount, currency: orders.currency, createdAt: orders.createdAt, email: customers.email, firstName: customers.firstName, lastName: customers.lastName }).from(orders).leftJoin(customers, eq(orders.customerId, customers.id)).where(where).orderBy(desc(orders.createdAt)).limit(pageSize).offset(offset);
  const href = (nextPage: number) => getAdminPageHref("/admin/invoices", { ...dateRangeQuery(range), pageSize: String(pageSize) }, nextPage);
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">发票管理</h1><p className="mt-2 text-sm text-black/55">此处基于真实订单展示可开具的订单金额和客户信息。正式税务发票号与开票服务接口将在当地税务要求确认后接入。</p><form className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-black/10 bg-white p-4"><DateRangeFilter range={range} preserve={{ pageSize: String(pageSize) }} /><div className="flex items-end gap-3"><PageSizeSelect value={pageSize} /><button className="rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">筛选订单</button></div></form><section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#f5f7f4]"><tr><th className="p-4">订单</th><th className="p-4">客户</th><th className="p-4">金额</th><th className="p-4">支付状态</th><th className="p-4">订单日期</th><th className="p-4">操作</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id} className="border-t border-black/8"><td className="p-4 font-mono text-xs font-bold">{row.orderNumber}</td><td className="p-4">{[row.firstName, row.lastName].filter(Boolean).join(" ") || row.email || "未命名客户"}</td><td className="p-4 font-bold">{row.currency} {row.total}</td><td className="p-4">{row.paymentStatus}</td><td className="p-4 text-black/55">{row.createdAt.toLocaleDateString("zh-CN")}</td><td className="p-4"><Link href={`/admin/orders/${row.id}`} className="rounded-lg border border-black/15 px-3 py-2 text-xs font-bold">查看订单 / 开票资料</Link></td></tr>) : <tr><td colSpan={6} className="p-14 text-center text-black/55">当前日期范围内暂无可处理订单。</td></tr>}</tbody></table></div><TablePagination page={page} pageSize={pageSize} total={total} href={href} label="份订单" /></section></main>;
}
