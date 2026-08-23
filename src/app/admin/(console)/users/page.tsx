import { asc, eq } from "drizzle-orm";
import { CreateAdminUserForm } from "@/components/admin/create-admin-user-form";
import { getDatabase } from "@/db/client";
import { adminUserRoles, adminUsers, roles } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";

export default async function UsersPage() {
  await requirePermission("settings.read");
  const db = getDatabase();
  const [rows, roleRows] = await Promise.all([
    db.select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, status: adminUsers.status, lastLoginAt: adminUsers.lastLoginAt, createdAt: adminUsers.createdAt, role: roles.name }).from(adminUsers).leftJoin(adminUserRoles, eq(adminUserRoles.adminUserId, adminUsers.id)).leftJoin(roles, eq(adminUserRoles.roleId, roles.id)).orderBy(asc(adminUsers.createdAt)),
    db.select({ id: roles.id, name: roles.name }).from(roles).orderBy(asc(roles.name)),
  ]);
  const users = Array.from(new Map(rows.map((row) => [row.id, { ...row, roles: rows.filter((item) => item.id === row.id).map((item) => item.role).filter(Boolean) }])).values());
  return <main className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10"><header className="border-b border-black/10 pb-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#538a42]">数据与系统</p><h1 className="mt-2 font-serif text-4xl font-bold">用户与权限</h1><p className="mt-2 text-sm text-black/55">管理员角色、登录状态和访问权限。密码只以安全哈希保存在服务端，后台不会显示或导出密码。</p></header><CreateAdminUserForm roles={roleRows}/><section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-[#f5f7f4] text-xs uppercase tracking-wide text-black/52"><tr><th className="px-5 py-4">管理员</th><th className="px-5 py-4">角色</th><th className="px-5 py-4">状态</th><th className="px-5 py-4">最近登录</th><th className="px-5 py-4">创建时间</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-black/8"><td className="px-5 py-4"><p className="font-bold">{user.name}</p><p className="mt-1 text-xs text-black/50">{user.email}</p></td><td className="px-5 py-4">{user.roles.join("、") || "未分配角色"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.status === "active" ? "bg-[#edf4e9] text-[#3e752e]" : "bg-black/5 text-black/55"}`}>{user.status === "active" ? "启用" : user.status}</span></td><td className="px-5 py-4 text-black/55">{user.lastLoginAt?.toLocaleString("zh-CN") ?? "尚未登录"}</td><td className="px-5 py-4 text-black/55">{user.createdAt.toLocaleString("zh-CN")}</td></tr>)}</tbody></table></div></section></main>;
}
