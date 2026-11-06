"use client";

import { useActionState } from "react";
import { submitSitemapNow } from "./actions";

export function SubmitSitemapForm() {
  const [message, submit, pending] = useActionState(submitSitemapNow, "");
  return <form action={submit} className="mt-4 flex flex-wrap items-center gap-3">
    <button type="submit" disabled={pending} className="rounded-xl border border-black/20 px-3 py-2 text-sm font-bold disabled:opacity-50">
      {pending ? "提交中…" : "立即提交站点地图"}
    </button>
    {message && <p role="status" className="text-sm text-black/65">{message}</p>}
  </form>;
}
