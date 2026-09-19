import { count, desc, eq } from "drizzle-orm";
import { ArticleForm } from "@/components/admin/content-forms";
import { PageSizeSelect } from "@/components/admin/page-size-select";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { contentArticles } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminPageHref, getAdminPagination } from "@/lib/admin/pagination";

type Search = { page?: string; pageSize?: string };

export default async function BlogPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("customers.read");
  const query = await searchParams;
  const { page, pageSize, offset } = getAdminPagination(query, 20);
  const db = getDatabase();
  const where = eq(contentArticles.type, "blog");
  const [{ total }] = await db.select({ total: count() }).from(contentArticles).where(where);
  const rows = await db.select().from(contentArticles).where(where).orderBy(desc(contentArticles.updatedAt)).limit(pageSize).offset(offset);
  const href = (nextPage: number) => getAdminPageHref("/admin/blog", { pageSize: String(pageSize) }, nextPage);

  return <main className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10"><header className="border-b border-black/10 pb-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#538a42]">客户与内容</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">博客管理</h1><p className="mt-2 text-sm text-black/55">管理博客正文、发布时间和 SEO 元数据。编辑器按需展开，列表每页固定显示。</p></header><section className="mt-6 grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]"><aside><h2 className="mb-3 font-serif text-2xl font-bold">新建博客</h2><ArticleForm type="blog" /></aside><div><form className="mb-4 flex justify-end"><PageSizeSelect value={pageSize} /></form><div className="overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="grid gap-4 p-4">{rows.length ? rows.map((row) => <details key={row.id} className="rounded-2xl border border-black/10 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5"><div><p className="font-bold">{row.title}</p><p className="mt-1 font-mono text-xs text-black/45">/{row.slug}</p></div><span className="rounded-full bg-[#edf4e9] px-2.5 py-1 text-xs font-bold text-[#3e752e]">{row.status}</span></summary><div className="border-t border-black/8 p-5"><ArticleForm type="blog" record={row} /></div></details>) : <div className="rounded-2xl border border-dashed border-black/15 bg-white p-12 text-center text-sm text-black/55">暂无博客内容。</div>}</div><TablePagination page={page} pageSize={pageSize} total={total} href={href} label="篇博客" /></div></div></section></main>;
}
