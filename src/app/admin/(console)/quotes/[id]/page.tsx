import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { adminUsers, productSkus, quoteRequests } from "@/db/schema";
import { getAdminPermissionCodes, requirePermission } from "@/lib/admin/auth";
import { quotePurposes, quoteStatuses } from "../status";
import { QuoteUpdateForm } from "./quote-update-form";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePermission("customers.read");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const db = getDatabase();
  const [[row], permissions] = await Promise.all([
    db.select({ quote: quoteRequests, sku: productSkus.sku, assignee: adminUsers.name }).from(quoteRequests)
      .leftJoin(productSkus, eq(quoteRequests.skuId, productSkus.id))
      .leftJoin(adminUsers, eq(quoteRequests.assignedTo, adminUsers.id)).where(eq(quoteRequests.id, id)),
    getAdminPermissionCodes(admin.id),
  ]);
  if (!row) notFound();
  const { quote } = row;
  const canEdit = permissions.includes("customers.update");
  const staff = canEdit ? await db.select({ id: adminUsers.id, name: adminUsers.name }).from(adminUsers)
    .where(eq(adminUsers.status, "active")).orderBy(asc(adminUsers.name)) : [];
  const facts = [
    ["联系人", quote.name], ["公司", quote.company || "—"], ["用途", quotePurposes[quote.purpose]],
    ["型号", quote.model || "待选"], ["SKU", row.sku || "—"], ["数量", quote.quantity],
    ["目的地", quote.destination], ["提交语言", quote.locale], ["负责人", row.assignee || "待分配"],
    ["报价（USD）", quote.quoteAmountUsd || "—"],
  ];
  return <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
    <Link href="/admin/quotes" className="text-sm font-bold text-[#3e7230]">← 返回采购询价</Link>
    <h1 className="mt-4 break-all font-mono text-2xl font-bold sm:text-3xl">{quote.reference}</h1>
    <p className="mt-2 text-sm text-black/65">{quoteStatuses[quote.status]} · 更新于 {quote.updatedAt.toISOString().slice(0, 16).replace("T", " ")} UTC</p>
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,.72fr)]">
      <section className="min-w-0 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-xl font-bold">采购需求</h2>
        <a href={`mailto:${quote.email}`} className="mt-2 inline-block break-all font-semibold text-[#3e7230] underline">{quote.email}</a>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">{facts.map(([label, value]) => <div key={label}><dt className="text-xs text-black/60">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{value}</dd></div>)}</dl>
        <h3 className="mt-5 font-bold">客户补充说明</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm text-black/70">{quote.message || "—"}</p>
        {!canEdit && <><h3 className="mt-5 font-bold">内部跟进记录</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm">{quote.followUpNote || "—"}</p></>}
      </section>
      {canEdit && <QuoteUpdateForm quote={quote} staff={staff} />}
    </div>
  </div>;
}
