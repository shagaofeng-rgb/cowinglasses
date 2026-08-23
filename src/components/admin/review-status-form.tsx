"use client";

import { useActionState } from "react";
import { initialReviewState, updateReviewAction } from "@/app/admin/(console)/reviews/actions";

export function ReviewStatusForm({ id, status, reply }: { id: string; status: string; reply: string | null }) {
  const [state, action, pending] = useActionState(updateReviewAction, initialReviewState);
  return <form action={action} className="grid gap-2"><input type="hidden" name="id" value={id}/><select name="status" defaultValue={status} className="rounded-lg border border-black/12 bg-white px-2 py-1.5 text-xs"><option value="pending">待审核</option><option value="published">发布</option><option value="hidden">隐藏</option></select><textarea name="adminReply" defaultValue={reply ?? ""} rows={2} placeholder="审核回复（可选）" className="rounded-lg border border-black/12 p-2 text-xs"/>{state.message ? <p role="status" className={`text-xs ${state.success ? "text-[#397431]" : "text-red-700"}`}>{state.message}</p> : null}<button disabled={pending} className="rounded-lg bg-[#17231c] px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{pending ? "保存中…" : "保存审核"}</button></form>;
}
