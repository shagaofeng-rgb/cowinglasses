import Link from "next/link";
import { getAdminNavigationItem } from "@/features/admin/navigation";

type Props = { pathname: string };

const setupRoutes = new Set(["/admin/channels/facebook", "/admin/channels/instagram", "/admin/channels/google", "/admin/channels/whatsapp", "/admin/settings/payments", "/admin/settings/logistics", "/admin/settings/notifications"]);

export function AdminModulePage({ pathname }: Props) {
  const item = getAdminNavigationItem(pathname);
  if (!item) return <div className="mx-auto max-w-4xl px-6 py-16"><h1 className="font-serif text-4xl font-bold">页面正在建设</h1><p className="mt-3 text-black/60">该后台地址尚未注册。请从左侧菜单进入已规划模块。</p><Link href="/admin" className="mt-6 inline-block rounded-xl bg-[#17231c] px-5 py-3 font-bold text-white">返回数据概览</Link></div>;
  const needsConnection = setupRoutes.has(pathname);
  return <div className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10">
    <div className="border-b border-black/10 pb-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#538a42]">{needsConnection ? "等待服务连接" : "后台运营模块"}</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em]">{item.label}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">{item.description}</p></div>
    {needsConnection ? <section className="mt-6 max-w-3xl rounded-2xl border border-black/10 bg-white p-7"><span className="inline-flex rounded-full bg-[#eef4ed] px-3 py-1 text-xs font-bold text-[#4e7f3f]">暂未连接</span><h2 className="mt-4 font-serif text-2xl font-bold">安全配置后即可启用</h2><p className="mt-3 text-sm leading-6 text-black/58">此模块不会模拟已连接的第三方服务。后续将从 Vercel 环境变量读取凭据，在服务端执行授权、签名校验、幂等处理和操作日志记录。</p><div className="mt-6 rounded-xl bg-[#f6f7f5] p-5 text-sm"><p className="font-bold">下一步需要的信息</p><ul className="mt-3 list-disc space-y-2 pl-5 text-black/60"><li>服务商 API 文档与测试环境</li><li>Webhook 地址、签名规则和重试策略</li><li>服务端凭据（仅录入 Vercel Environment Variables）</li></ul></div></section> : <section className="mt-6 rounded-2xl border border-black/10 bg-white p-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><span className="inline-flex rounded-full bg-[#eef4ed] px-3 py-1 text-xs font-bold text-[#4e7f3f]">数据模型接入中</span><h2 className="mt-4 font-serif text-2xl font-bold">可运营页面框架已就绪</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-black/58">本路由已纳入统一导航和权限注册表。接下来将按模块接入 Neon 查询、筛选、分页、批量操作、状态流转和审计日志。</p></div><button className="rounded-xl bg-[#17231c] px-5 py-3 text-sm font-bold text-white">新建{item.label.replace("管理", "")}</button></div><div className="mt-7 rounded-xl border border-dashed border-black/15 bg-[#fafbfa] px-6 py-12 text-center"><p className="font-semibold">暂无业务数据</p><p className="mt-2 text-sm text-black/52">完成数据库迁移与种子数据初始化后，这里将显示真实记录。</p></div></section>}
  </div>;
}
