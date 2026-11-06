"use client";

import { useActionState } from "react";
import { saveStockCount } from "./actions";

const input = "mt-2 w-full rounded-xl border border-black/15 px-3 py-2.5";

export function StockCountForm({ skuId, onHand, reorderPoint }: { skuId: string; onHand: number; reorderPoint: number }) {
  const [message, action, pending] = useActionState(saveStockCount, "");
  return <form action={action} className="mt-6 grid gap-4 rounded-2xl border border-black/10 bg-white p-5 sm:grid-cols-2 sm:p-6">
    <input type="hidden" name="skuId" value={skuId} />
    <label className="text-sm font-semibold">实物盘点数量<input className={input} name="onHand" type="number" min={0} max={1_000_000} defaultValue={onHand} required /></label>
    <label className="text-sm font-semibold">预警阈值<input className={input} name="reorderPoint" type="number" min={0} max={1_000_000} defaultValue={reorderPoint} required /></label>
    <label className="text-sm font-semibold sm:col-span-2">盘点记录编号或说明<input className={input} name="reference" minLength={3} maxLength={200} required /></label>
    <label className="flex items-start gap-2 text-sm sm:col-span-2"><input className="mt-1 size-4 accent-[#538a42]" type="checkbox" name="confirm" required />我已核对实物数量或确认需要暂停此仓位的销售。</label>
    <div className="flex flex-wrap gap-2 sm:col-span-2">
      <button name="mode" value="verify" disabled={pending} className="rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">确认盘点并同步</button>
      <button name="mode" value="pause" disabled={pending} className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-bold disabled:opacity-50">暂停现货销售</button>
    </div>
    {message && <p role="status" className="rounded-xl bg-[#f1f5ee] p-3 text-sm sm:col-span-2">{message}</p>}
  </form>;
}
