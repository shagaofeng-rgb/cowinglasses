import Link from "next/link";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { getDatabase } from "@/db/client";
import { requirePermission } from "@/lib/admin/auth";

export default async function SettingsPage() {
  await requirePermission("settings.read");
  const row = await getDatabase().query.storeSettings.findFirst({ where: (settings, { eq }) => eq(settings.key, "storefront") });
  const value = (row?.value ?? {}) as { storeName?: string; siteUrl?: string; supportEmail?: string; currency?: string; orderPrefix?: string };
  return <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 lg:px-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#538a42]">数据与系统</p><h1 className="mt-2 font-serif text-4xl font-bold">系统设置</h1><p className="mt-2 text-sm leading-6 text-black/55">商城基础信息保存在 Neon，并通过管理员权限与操作日志保护。</p><StoreSettingsForm value={value}/><section className="mt-6 grid gap-4 md:grid-cols-3">{[["支付配置", "/admin/settings/payments", "等待服务商正式参数"], ["物流配置", "/admin/settings/logistics", "等待物流服务商 API"], ["通知设置", "/admin/settings/notifications", "等待邮件 / 短信凭据"]].map(([title, href, description]) => <Link key={href} href={href} className="rounded-2xl border border-black/10 bg-white p-5 transition hover:border-[#548544]"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-black/55">{description}</p></Link>)}</section></main>;
}
