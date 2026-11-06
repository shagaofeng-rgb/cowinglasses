import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import Link from "next/link";
import { PageSizeSelect } from "@/components/admin/page-size-select";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { adminUsers, quoteRequests, quoteStatus } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminPageHref, getAdminPagination } from "@/lib/admin/pagination";
import { quotePurposes, quoteStatuses } from "./status";

type Search = { q?: string; status?: string; page?: string; pageSize?: string };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("customers.read");
  const query = await searchParams;
  const { page, pageSize, offset } = getAdminPagination(query, 20);
  const status = quoteStatus.enumValues.find((value) => value === query.status);
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 120) : "";
  const where = and(status ? eq(quoteRequests.status, status) : undefined, q ? or(
    ilike(quoteRequests.reference, `%${q}%`), ilike(quoteRequests.email, `%${q}%`), ilike(quoteRequests.model, `%${q}%`),
  ) : undefined);
  const db = getDatabase();
  const [[total], rows] = await Promise.all([
    db.select({ count: count() }).from(quoteRequests).where(where),
    db.select({
      id: quoteRequests.id, reference: quoteRequests.reference, model: quoteRequests.model, name: quoteRequests.name,
      company: quoteRequests.company, destination: quoteRequests.destination, quantity: quoteRequests.quantity, status: quoteRequests.status,
      purpose: quoteRequests.purpose, assignee: adminUsers.name, createdAt: quoteRequests.createdAt,
    }).from(quoteRequests).leftJoin(adminUsers, eq(quoteRequests.assignedTo, adminUsers.id)).where(where)
      .orderBy(desc(quoteRequests.createdAt), desc(quoteRequests.id)).limit(pageSize).offset(offset),
  ]);
  return <div className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10">
    <p className="text-xs font-bold tracking-widest text-[#3e7230]">客户与内容</p>
    <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">采购询价</h1>
    <p className="mt-2 text-sm text-black/65">核对商品、数量与目的地，分配负责人，记录报价与后续沟通。</p>
    <form className="mt-6 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_150px_135px_auto]">
      <input name="q" aria-label="搜索编号、邮箱或型号" defaultValue={q} placeholder="搜索编号、邮箱或型号" className="min-w-0 rounded-xl border border-black/15 px-3 py-2.5" />
      <select name="status" aria-label="跟进状态" defaultValue={status ?? ""} className="rounded-xl border border-black/15 bg-white px-3 py-2.5"><option value="">全部状态</option>{Object.entries(quoteStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <PageSizeSelect value={pageSize} /><button className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-bold">筛选</button>
    </form>
    <section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div role="region" aria-label="采购询价列表" tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[690px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3">
          <thead className="bg-[#f5f7f4] text-xs text-black/65"><tr>{["编号 / 时间", "客户", "型号 / 数量", "目的地", "状态 / 负责人"].map((title) => <th key={title} scope="col">{title}</th>)}</tr></thead>
          <tbody>{rows.length ? rows.map((row) => <tr key={row.id} className="border-t border-black/10">
            <td><Link href={`/admin/quotes/${row.id}`} className="font-mono font-bold text-[#3e7230]">{row.reference}</Link><p className="text-xs text-black/60">{row.createdAt.toISOString().slice(0, 10)}</p></td>
            <td>{row.name}<p className="text-xs text-black/60">{row.company || quotePurposes[row.purpose]}</p></td>
            <td>{row.model || "待选型号"} · {row.quantity}</td><td>{row.destination}</td>
            <td className="font-semibold">{quoteStatuses[row.status]}<p className="text-xs font-normal text-black/60">{row.assignee || "待分配"}</p></td>
          </tr>) : <tr><td colSpan={5} className="text-center text-black/60">当前条件下暂无询价。</td></tr>}</tbody>
        </table>
      </div>
      <TablePagination page={page} pageSize={pageSize} total={total.count} href={(next) => getAdminPageHref("/admin/quotes", { q, status, pageSize: String(pageSize) }, next)} />
    </section>
  </div>;
}
