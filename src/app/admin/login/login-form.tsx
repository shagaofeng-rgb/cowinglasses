"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!configured) return; setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("admin-credentials", { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""), redirect: false });
    if (result?.error) { setError("邮箱、密码不正确，或该账号尚未启用。"); setPending(false); return; }
    router.replace("/admin"); router.refresh();
  }
  return <form className="mt-8 space-y-4" onSubmit={submit}><label className="block text-sm font-semibold">管理员账号<input required disabled={!configured || pending} name="email" type="text" autoComplete="username" placeholder="请输入管理员账号" className="mt-2 w-full rounded-xl border border-black/12 bg-[#f7f8f7] px-4 py-3 outline-none transition focus:border-[#548544] focus:ring-2 focus:ring-[#b8e629]/30 disabled:cursor-not-allowed disabled:text-black/35" /></label><label className="block text-sm font-semibold">密码<input required disabled={!configured || pending} name="password" type="password" autoComplete="current-password" placeholder="••••••••" className="mt-2 w-full rounded-xl border border-black/12 bg-[#f7f8f7] px-4 py-3 outline-none transition focus:border-[#548544] focus:ring-2 focus:ring-[#b8e629]/30 disabled:cursor-not-allowed disabled:text-black/35" /></label>{error ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}<button type="submit" disabled={!configured || pending} className="w-full rounded-xl bg-[#17231c] px-4 py-3 font-bold text-white transition hover:bg-[#264436] disabled:cursor-not-allowed disabled:opacity-50">{pending ? "正在验证…" : configured ? "登录后台" : "等待数据库初始化"}</button></form>;
}
