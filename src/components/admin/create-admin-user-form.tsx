"use client";

import { useActionState } from "react";
import { createAdminUserAction, initialUserFormState } from "@/app/admin/(console)/users/actions";

export function CreateAdminUserForm({ roles }: { roles: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createAdminUserAction, initialUserFormState);
  return <form action={action} className="mt-6 grid gap-3 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-2"><h2 className="md:col-span-2 font-serif text-2xl font-bold">新增管理员</h2><label className="text-sm font-semibold">姓名<input required name="name" className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5" /></label><label className="text-sm font-semibold">登录账号（邮箱）<input required name="email" type="email" className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5" /></label><label className="text-sm font-semibold">初始密码<input required name="password" type="password" minLength={12} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5" /></label><label className="text-sm font-semibold">角色<select required name="roleId" defaultValue="" className="mt-2 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5"><option value="" disabled>选择角色</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>{state.message ? <p role="status" className={`md:col-span-2 rounded-xl px-3 py-2 text-sm ${state.success ? "bg-[#eef8e8] text-[#376c2a]" : "bg-red-50 text-red-700"}`}>{state.message}</p> : null}<div className="md:col-span-2"><button disabled={pending} className="rounded-xl bg-[#17231c] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{pending ? "正在创建…" : "创建管理员"}</button></div></form>;
}
