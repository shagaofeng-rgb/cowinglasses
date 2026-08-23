import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDatabase } from "@/db/client";
import { contentArticles } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";

export default async function NewsOperationsPage() {
  await requirePermission("customers.read");
  const rows = await getDatabase().select().from(contentArticles).where(eq(contentArticles.type, "news")).orderBy(asc(contentArticles.status), desc(contentArticles.updatedAt));
  const groups = { draft: rows.filter((row) => row.status === "draft"), scheduled: rows.filter((row) => row.status === "scheduled"), published: rows.filter((row) => row.status === "published"), offline: rows.filter((row) => row.status === "offline") };
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">新闻自主运营</h1><p className="mt-2 text-sm text-black/55">根据真实发布状态组织新闻内容。进入新闻管理即可编辑正文、SEO 字段及发布状态。</p><div className="mt-6 grid gap-4 sm:grid-cols-4">{Object.entries(groups).map(([status, list]) => <article key={status} className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-sm text-black/55">{label(status)}</p><p className="mt-3 text-3xl font-bold">{list.length}</p></article>)}</div><section className="mt-6 grid gap-5 lg:grid-cols-2">{Object.entries(groups).map(([status, list]) => <article key={status} className="rounded-2xl border border-black/10 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">{label(status)}</h2><span className="text-sm text-black/50">{list.length} 篇</span></div><div className="mt-4 grid gap-3">{list.length ? list.map((row) => <div key={row.id} className="rounded-xl bg-[#f5f7f4] p-4"><p className="font-bold">{row.title}</p><p className="mt-1 font-mono text-xs text-black/50">/{row.slug}</p><p className="mt-2 text-xs text-black/55">更新于 {row.updatedAt.toLocaleString("zh-CN")}</p></div>) : <p className="rounded-xl bg-[#f5f7f4] p-4 text-sm text-black/55">暂无内容。</p>}</div></article>)}</section><Link className="mt-6 inline-block rounded-xl bg-[#17231c] px-5 py-3 text-sm font-bold text-white" href="/admin/news">进入新闻管理</Link></main>;
}
function label(status: string) { return ({ draft: "草稿", scheduled: "定时发布", published: "已发布", offline: "已下线" } as Record<string, string>)[status] ?? status; }
