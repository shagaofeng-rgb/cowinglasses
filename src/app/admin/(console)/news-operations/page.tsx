import Link from "next/link";
import { getNewsAutomationDashboard } from "@/lib/news/service";
import { requirePermission } from "@/lib/admin/auth";
import { runNewsDryRunAction, runNewsIngestAction, runNewsPublishAction, runNewsSourceHealthAction, updateNewsAutomationAction } from "./actions";

export const dynamic = "force-dynamic";

function date(value?: Date | null) { return value ? value.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "尚未运行"; }
function pill(status: string) { const good = ["healthy", "completed", "published_success", "auto", "candidate"].includes(status); const bad = ["failed", "disabled", "rejected"].includes(status); return `rounded-full px-2.5 py-1 text-xs font-bold ${good ? "bg-[#eaf6df] text-[#3f762d]" : bad ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`; }

export default async function NewsOperationsPage() {
  await requirePermission("customers.read");
  const data = await getNewsAutomationDashboard();
  const state = data.state;
  const candidateCount = data.candidates.filter((item) => item.status === "candidate" || item.status === "retry_pending").length;
  return <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">
    <header className="flex flex-col gap-4 border-b border-black/10 pb-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#538a42]">News Automation</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">新闻自主运营</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">每12小时采集与检查，每48小时最多发布一篇。无合格来源时安全跳过，不生成虚假内容。</p></div><Link className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold" href="/admin/news">进入人工新闻管理</Link></header>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Metric label="运行状态" value={state?.enabled ? "已启用" : "已暂停"}/><Metric label="发布模式" value={state?.publishingMode === "auto" ? "全自动" : "人工审核"}/><Metric label="合格候选" value={String(candidateCount)}/><Metric label="最近采集" value={date(state?.lastIngestAt)}/><Metric label="下次可发布" value={date(state?.nextEligibleAt)}/>
    </section>

    <section className="mt-6 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="grid content-start gap-5">
        <form action={updateNewsAutomationAction} className="rounded-2xl border border-black/10 bg-white p-5"><h2 className="font-serif text-2xl font-bold">控制中心</h2><label className="mt-4 block text-sm font-semibold">自动化状态<select name="enabled" defaultValue={String(state?.enabled ?? true)} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5"><option value="true">启用</option><option value="false">暂停</option></select></label><label className="mt-4 block text-sm font-semibold">发布模式<select name="publishingMode" defaultValue={state?.publishingMode ?? "auto"} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5"><option value="auto">全自动发布</option><option value="review">生成草稿，人工审核</option></select></label><button className="mt-4 w-full rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white">保存设置</button></form>
        <div className="rounded-2xl border border-black/10 bg-white p-5"><h2 className="font-serif text-2xl font-bold">手动操作</h2><div className="mt-4 grid gap-2"><Action action={runNewsIngestAction} label="立即采集"/><Action action={runNewsDryRunAction} label="发布 Dry Run"/><Action action={runNewsSourceHealthAction} label="检查来源健康"/><Action action={runNewsPublishAction} label="立即执行发布" primary/></div><p className="mt-3 text-xs leading-5 text-black/50">立即发布仍受48小时门槛、候选评分、内容验证和重复锁保护。</p></div>
      </aside>

      <div className="grid gap-5">
        <Panel title="来源健康"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase text-black/45"><tr><th className="pb-3">来源</th><th className="pb-3">等级</th><th className="pb-3">信任分</th><th className="pb-3">健康</th><th className="pb-3">最近成功</th><th className="pb-3">错误</th></tr></thead><tbody>{data.sources.map((source) => <tr key={source.id} className="border-t border-black/8"><td className="py-3"><p className="font-bold">{source.name}</p><p className="text-xs text-black/45">{source.domain}</p></td><td>{source.tier}</td><td>{source.trustScore}</td><td><span className={pill(source.healthStatus)}>{source.healthStatus}</span></td><td>{date(source.lastSuccessAt)}</td><td className="max-w-64 truncate text-xs text-red-700">{source.lastError || "—"}</td></tr>)}</tbody></table></div></Panel>
        <Panel title="最近候选"><div className="grid gap-3">{data.candidates.slice(0, 20).map((candidate) => <article key={candidate.id} className="rounded-xl bg-[#f5f7f4] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="font-bold">{candidate.title}</p><p className="mt-1 truncate text-xs text-black/45">{candidate.sourceUrl}</p></div><div className="flex gap-2"><span className={pill(candidate.status)}>{candidate.status}</span><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold">{candidate.score}</span></div></div>{candidate.rejectReason ? <p className="mt-2 text-xs leading-5 text-red-700">{candidate.rejectReason}</p> : null}</article>)}{!data.candidates.length ? <p className="text-sm text-black/50">尚无候选，请先运行采集。</p> : null}</div></Panel>
        <Panel title="运行审计"><div className="grid gap-3">{data.runs.map((run) => <article key={run.id} className="grid gap-2 rounded-xl border border-black/8 p-4 sm:grid-cols-[150px_120px_minmax(0,1fr)]"><div><p className="font-mono text-xs">{date(run.startedAt)}</p><p className="mt-1 text-xs text-black/45">{run.trigger}</p></div><div><span className={pill(run.status)}>{run.status}</span><p className="mt-2 text-xs text-black/45">{run.kind}</p></div><p className="text-sm leading-6 text-black/65">{run.reason}</p></article>)}</div></Panel>
      </div>
    </section>
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-black/45">{label}</p><p className="mt-3 break-words text-xl font-bold">{value}</p></article>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-black/10 bg-white p-5"><h2 className="mb-4 font-serif text-2xl font-bold">{title}</h2>{children}</section>; }
function Action({ action, label, primary = false }: { action: () => Promise<void>; label: string; primary?: boolean }) { return <form action={action}><button className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold ${primary ? "bg-[#b8e629] text-[#17231c]" : "border border-black/10 bg-[#f5f7f4]"}`}>{label}</button></form>; }
