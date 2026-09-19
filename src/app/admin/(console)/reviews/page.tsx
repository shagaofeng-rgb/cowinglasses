import { count, desc, eq } from "drizzle-orm";
import { PageSizeSelect } from "@/components/admin/page-size-select";
import { ReviewStatusForm } from "@/components/admin/review-status-form";
import { TablePagination } from "@/components/admin/table-pagination";
import { getDatabase } from "@/db/client";
import { customers, productReviews, products } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminPageHref, getAdminPagination } from "@/lib/admin/pagination";

type Search = { page?: string; pageSize?: string };

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("catalog.read");
  const { page, pageSize, offset } = getAdminPagination(await searchParams, 20);
  const db = getDatabase();
  const [{ total }] = await db.select({ total: count() }).from(productReviews);
  const rows = await db.select({ id: productReviews.id, rating: productReviews.rating, title: productReviews.title, body: productReviews.body, status: productReviews.status, reply: productReviews.adminReply, createdAt: productReviews.createdAt, product: products.name, customer: customers.email }).from(productReviews).innerJoin(products, eq(productReviews.productId, products.id)).leftJoin(customers, eq(productReviews.customerId, customers.id)).orderBy(desc(productReviews.createdAt)).limit(pageSize).offset(offset);
  const href = (nextPage: number) => getAdminPageHref("/admin/reviews", { pageSize: String(pageSize) }, nextPage);
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">评价管理</h1><p className="mt-2 text-sm text-black/55">所有评价均需要审核后才可发布。当前前台尚未开放公开评价提交入口，因此这里只会展示未来通过受控入口写入的真实评价。</p><form className="mt-5 rounded-2xl border border-black/10 bg-white p-4"><div className="w-fit"><PageSizeSelect value={pageSize}/></div><button className="mt-3 rounded-lg border border-black/15 px-3 py-2 text-xs font-bold">应用</button></form><section className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="grid gap-4 p-4">{rows.length ? rows.map((row) => <article key={row.id} className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 lg:grid-cols-[1fr_250px]"><div><div className="flex flex-wrap items-center gap-3"><strong>{row.product}</strong><span className="text-[#9aa817]">{"★".repeat(row.rating)}{"☆".repeat(5 - row.rating)}</span><span className="text-xs text-black/50">{row.createdAt.toLocaleString("zh-CN")}</span></div><p className="mt-3 font-bold">{row.title || "未填写标题"}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/65">{row.body || "未填写评价内容"}</p><p className="mt-3 text-xs text-black/50">客户：{row.customer || "匿名 / 未关联客户"}</p></div><ReviewStatusForm id={row.id} status={row.status} reply={row.reply}/></article>) : <div className="rounded-2xl border border-dashed border-black/15 bg-white p-14 text-center text-black/55">暂无待审核评价。前台评价入口启用后，真实评价会在这里等待审核。</div>}</div><TablePagination page={page} pageSize={pageSize} total={Number(total)} href={href} label="条评价"/></section></main>;
}
