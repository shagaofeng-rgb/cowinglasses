import { and, desc, eq, gte, lte } from "drizzle-orm";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { getDatabase } from "@/db/client";
import { storefrontEvents } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getDateRange } from "@/lib/admin/date-range";

type Submission = { kind?: string; name?: string; email?: string; orderNumber?: string; productModel?: string; message?: string; mediaUrl?: string };

export default async function CustomerFormsPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  await requirePermission("customers.read");
  const range = getDateRange(await searchParams);
  const rows = await getDatabase().select({ id: storefrontEvents.id, createdAt: storefrontEvents.createdAt, metadata: storefrontEvents.metadata }).from(storefrontEvents).where(and(gte(storefrontEvents.createdAt, range.from), lte(storefrontEvents.createdAt, range.to), eq(storefrontEvents.eventName, "support_form"))).orderBy(desc(storefrontEvents.createdAt)).limit(200);
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">客户表单</h1><p className="mt-2 text-sm text-black/55">前台联系、保修与订阅表单会直接写入本页；仅保存客户主动提交的信息。</p><form className="mt-5 rounded-2xl border border-black/10 bg-white p-4"><DateRangeFilter range={range}/><button className="mt-3 rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">筛选表单</button></form><section className="mt-6 grid gap-4">{rows.length ? rows.map((row) => { const submission = row.metadata as Submission; return <article key={row.id} className="rounded-2xl border border-black/10 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-[#edf4e9] px-3 py-1 text-xs font-bold text-[#397431]">{submission.kind === "warranty" ? "保修申请" : submission.kind === "newsletter" ? "订阅" : "联系支持"}</span><time className="text-xs text-black/50">{row.createdAt.toLocaleString("zh-CN")}</time></div><div className="mt-4 grid gap-3 md:grid-cols-2"><p><strong>客户：</strong>{submission.name || "—"}</p><p><strong>邮箱：</strong>{submission.email || "—"}</p>{submission.orderNumber ? <p><strong>订单号：</strong>{submission.orderNumber}</p> : null}{submission.productModel ? <p><strong>产品：</strong>{submission.productModel}</p> : null}</div>{submission.message ? <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#f5f7f4] p-4 text-sm leading-6">{submission.message}</p> : null}{submission.mediaUrl ? <a className="mt-4 inline-block text-sm font-bold text-[#477a39] underline" href={submission.mediaUrl} target="_blank" rel="noreferrer">查看客户提供的媒体链接</a> : null}</article>; }) : <div className="rounded-2xl border border-dashed border-black/15 bg-white p-14 text-center text-black/55">当前日期范围内暂无前台表单提交。</div>}</section></main>;
}
