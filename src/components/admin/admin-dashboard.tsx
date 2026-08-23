import Link from "next/link";

const metrics = [
  ["今日销售额", "—", "接入订单数据后显示"],
  ["本周订单", "—", "尚未初始化 Neon 数据库"],
  ["本月客单价", "—", "含已支付订单"],
  ["退款金额", "—", "含已审核退款"],
];

const nextSteps = [
  ["连接 Neon PostgreSQL", "创建数据库并填写仅服务端使用的 DATABASE_URL。", "数据库设置"],
  ["创建首个超级管理员", "完成管理员登录、角色和权限初始化。", "用户与权限"],
  ["导入商品与库存", "将现有商品与 SKU 迁入后台的商品和库存模型。", "商品管理"],
  ["配置支付与物流", "等待服务商提供回调、签名与生产凭据后启用。", "支付配置"],
];

export function AdminDashboard() {
  return <div className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10">
    <div className="flex flex-col gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#538a42]">COWIN Glasses 后台</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em]">数据概览</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">运营数据将在 Neon 数据库、订单与支付适配器连接后实时显示。当前界面使用明确的初始化状态，不展示伪造业务数据。</p></div>
      <div className="flex gap-2"><button className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold">最近 30 天</button><button className="rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">导出报表</button></div>
    </div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, note]) => <article key={label} className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(15,25,19,0.04)]"><p className="text-sm font-semibold text-black/58">{label}</p><p className="mt-4 text-4xl font-bold tracking-[-0.05em]">{value}</p><p className="mt-3 text-xs text-black/45">{note}</p></article>)}</div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
      <section className="rounded-2xl border border-black/10 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold">订单趋势</h2><p className="mt-1 text-sm text-black/50">等待订单数据接入</p></div><span className="rounded-full bg-[#edf6df] px-3 py-1 text-xs font-bold text-[#477b38]">待初始化</span></div><div className="mt-8 flex h-56 items-end gap-3 rounded-xl bg-[linear-gradient(180deg,rgba(184,230,41,0.12),transparent)] px-6 pb-7">{[24,36,28,52,41,66,38,47,30,58,44,70].map((height, index) => <div key={index} className="flex-1 rounded-t-lg bg-[#dfe9dc]" style={{ height: `${height}%` }} />)}</div></section>
      <section className="rounded-2xl border border-black/10 bg-white p-6"><h2 className="font-serif text-2xl font-bold">待处理事项</h2><div className="mt-5 space-y-3">{[["库存预警", "连接库存后显示", "库存管理"],["待处理售后", "连接订单后显示", "售后工单"],["支付回调", "配置服务商后启用", "支付配置"]].map(([title, detail, target]) => <div key={title} className="rounded-xl border border-black/8 p-4"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-black/52">{detail}</p><Link href={`/admin/${target === "库存管理" ? "inventory" : target === "售后工单" ? "tickets" : "settings/payments"}`} className="mt-3 inline-block text-sm font-bold text-[#477b38]">前往配置 →</Link></div>)}</div></section>
    </div>
    <section className="mt-6 rounded-2xl border border-[#bdd79a] bg-[#f1f8e7] p-6"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#477b38]">初始化清单</p><h2 className="mt-2 font-serif text-3xl font-bold">让后台开始服务真实订单</h2><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{nextSteps.map(([title, description, action]) => <div key={title} className="rounded-xl bg-white/80 p-4"><p className="font-bold">{title}</p><p className="mt-2 min-h-10 text-sm leading-5 text-black/58">{description}</p><span className="mt-3 inline-block text-sm font-bold text-[#477b38]">{action} →</span></div>)}</div></section>
  </div>;
}
