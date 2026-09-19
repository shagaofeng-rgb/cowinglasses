import { count, desc, eq } from "drizzle-orm";
import { ArticleForm } from "@/components/admin/content-forms";
import { PageSizeSelect } from "@/components/admin/page-size-select";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { contentArticles } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminPageHref, getAdminPagination } from "@/lib/admin/pagination";

type Search = { page?: string; pageSize?: string };

export default async function NewsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("customers.read");
  const { page, pageSize, offset } = getAdminPagination(await searchParams, 20);
  const db = getDatabase();
  const where = eq(contentArticles.type, "news");
  const [{ total }] = await db.select({ total: count() }).from(contentArticles).where(where);
  const rows = await db.select().from(contentArticles).where(where).orderBy(desc(contentArticles.updatedAt)).limit(pageSize).offset(offset);
  const href = (nextPage: number) => getAdminPageHref("/admin/news", { pageSize: String(pageSize) }, nextPage);
  return <main className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10"><header className="border-b border-black/10 pb-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#538a42]">客户与内容</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">新闻管理</h1><p className="mt-2 text-sm text-black/55">创建新闻草稿、安排发布、下线与管理 SEO。</p></header><section className="mt-6 grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]"><aside><h2 className="mb-3 font-serif text-2xl font-bold">新建新闻</h2><ArticleForm type="news"/></aside><div className="overflow-hidden rounded-2xl border border-black/10 bg-white"><form className="border-b border-black/8 p-4"><div className="w-fit"><PageSizeSelect value={pageSize}/></div><button className="mt-3 rounded-lg border border-black/15 px-3 py-2 text-xs font-bold">应用</button></form><div className="grid gap-4 p-4">{rows.length ? rows.map((row) => <details key={row.id} className="rounded-2xl border border-black/10 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5"><div><p className="font-bold">{row.title}</p><p className="mt-1 font-mono text-xs text-black/45">/{row.slug}</p></div><span className="rounded-full bg-[#edf4e9] px-2.5 py-1 text-xs font-bold text-[#3e752e]">{row.status}</span></summary><div className="border-t border-black/8 p-5"><ArticleForm type="news" record={row}/></div></details>) : <div className="rounded-2xl border border-dashed border-black/15 bg-white p-12 text-center text-sm text-black/55">暂无新闻内容。</div>}</div><TablePagination page={page} pageSize={pageSize} total={Number(total)} href={href} label="篇新闻"/></div></section></main>;
}
