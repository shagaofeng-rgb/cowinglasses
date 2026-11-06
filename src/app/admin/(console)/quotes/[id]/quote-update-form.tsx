"use client";

import { useActionState } from "react";
import { quoteStatuses } from "../status";
import { updateQuote } from "./actions";

type Values = { id: string; status: keyof typeof quoteStatuses; assignedTo: string | null; quoteAmountUsd: string | null; followUpNote: string | null };
const field = "mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2.5";

export function QuoteUpdateForm({ quote, staff }: { quote: Values; staff: { id: string; name: string }[] }) {
  const [message, action, pending] = useActionState(updateQuote, "");
  return <form action={action} className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5">
    <h2 className="text-xl font-bold">跟进与报价</h2>
    <input type="hidden" name="id" value={quote.id} />
    <label className="text-sm font-semibold">状态<select name="status" defaultValue={quote.status} className={field}>{Object.entries(quoteStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label className="text-sm font-semibold">负责人<select name="assignedTo" defaultValue={quote.assignedTo ?? ""} className={field}><option value="">待分配</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label className="text-sm font-semibold">报价金额（USD）<input name="quoteAmountUsd" inputMode="decimal" defaultValue={quote.quoteAmountUsd ?? ""} className={field} /></label>
    <label className="text-sm font-semibold">内部跟进记录<textarea name="followUpNote" rows={4} maxLength={2000} defaultValue={quote.followUpNote ?? ""} className={field} /></label>
    <button type="submit" className="rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" disabled={pending}>保存跟进记录</button>
    {message && <p role="status" className="rounded-xl bg-[#f1f5ee] p-3 text-sm">{message}</p>}
  </form>;
}
