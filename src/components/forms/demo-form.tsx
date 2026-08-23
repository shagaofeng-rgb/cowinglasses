"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/messages";

type Field = { label: string; name: string; required?: boolean; textarea?: boolean; type?: "email" | "text" | "url" };

const fieldSets: Record<"support" | "warranty" | "newsletter", Field[]> = {
  support: [
    { label: "Name", name: "name", required: true },
    { label: "Email address", name: "email", type: "email", required: true },
    { label: "Order number (optional)", name: "orderNumber" },
    { label: "How can we help?", name: "message", textarea: true, required: true },
  ],
  warranty: [
    { label: "Order number", name: "orderNumber", required: true },
    { label: "Product model", name: "productModel", required: true },
    { label: "Issue description", name: "message", textarea: true, required: true },
    { label: "Photo or video link", name: "mediaUrl", type: "url" },
  ],
  newsletter: [{ label: "Email address", name: "email", type: "email", required: true }],
};

export function DemoForm({ locale, kind = "support" }: { locale: Locale; kind?: "support" | "warranty" | "newsletter" }) {
  const [state, setState] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const t = messages[locale];
  const fields = fieldSets[kind];

  if (state === "sent") return <p role="status" className="rounded-2xl bg-[#e4edcb] p-5 leading-6">{t.support.formSuccess}</p>;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("submitting");
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/storefront/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, ...values }) });
      if (!response.ok) throw new Error("request_failed");
      setState("sent");
      form.reset();
    } catch { setState("error"); }
  }

  return <form className="grid gap-4" onSubmit={submit} noValidate>
    {fields.map((field) => <label className="grid gap-2 text-sm font-bold" key={field.name}>{field.label}
      {field.textarea
        ? <textarea name={field.name} required={field.required} className="min-h-28 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 font-normal" />
        : <input name={field.name} required={field.required} type={field.type ?? "text"} className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 font-normal" />}
    </label>)}
    {state === "error" ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">提交失败，请稍后重试或直接发送邮件至 info@cowinglasses.com。</p> : null}
    <button disabled={state === "submitting"} className="button-primary mt-2 disabled:opacity-60" type="submit">{state === "submitting" ? "Submitting…" : t.common.submit}</button>
  </form>;
}
