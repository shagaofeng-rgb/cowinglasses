import "server-only";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAuditLog } from "@/lib/admin/audit";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { adminUserRoles, adminUsers, permissions, rolePermissions, roles } from "@/db/schema";

const credentialsSchema = z.object({ email: z.string().email().max(320), password: z.string().min(8).max(200) });

async function getRolesForUser(adminUserId: string) {
  const records = await getDatabase().select({ code: roles.code }).from(adminUserRoles).innerJoin(roles, eq(adminUserRoles.roleId, roles.id)).where(eq(adminUserRoles.adminUserId, adminUserId));
  return records.map((record) => record.code);
}

export const adminAuthOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [CredentialsProvider({
    id: "admin-credentials",
    name: "COWIN 管理员账号",
    credentials: { email: { label: "邮箱", type: "email" }, password: { label: "密码", type: "password" } },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success || !isDatabaseConfigured()) return null;
      const email = parsed.data.email.toLowerCase();
      const user = (await getDatabase().select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1))[0];
      if (!user || user.status !== "active") { await writeAuditLog({ action: "auth.sign_in", resourceType: "admin_user", result: "failure", metadata: { email } }); return null; }
      if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) { await writeAuditLog({ actorId: user.id, action: "auth.sign_in", resourceType: "admin_user", resourceId: user.id, result: "failure" }); return null; }
      const roles = await getRolesForUser(user.id);
      await writeAuditLog({ actorId: user.id, action: "auth.sign_in", resourceType: "admin_user", resourceId: user.id, result: "success" });
      return { id: user.id, email: user.email, name: user.name, roles };
    },
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { token.id = user.id; token.roles = user.roles ?? []; } return token; },
    async session({ session, token }) { if (session.user && token.id) { session.user.id = token.id; session.user.roles = token.roles ?? []; } return session; },
  },
};

export async function getCurrentAdmin() {
  const session = await getServerSession(adminAuthOptions);
  if (!session?.user?.id || !isDatabaseConfigured()) return null;
  const user = (await getDatabase().select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, status: adminUsers.status }).from(adminUsers).where(and(eq(adminUsers.id, session.user.id), eq(adminUsers.status, "active"))).limit(1))[0];
  return user ? { ...user, roles: session.user.roles } : null;
}

export async function requireAdmin() {
  const administrator = await getCurrentAdmin();
  if (!administrator) redirect("/admin/login");
  return administrator;
}

export async function requirePermission(permissionCode: string) {
  const administrator = await requireAdmin();
  if (administrator.roles.includes("super_admin")) return administrator;
  const allowed = await getDatabase().select({ code: permissions.code }).from(adminUserRoles).innerJoin(rolePermissions, eq(adminUserRoles.roleId, rolePermissions.roleId)).innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id)).where(and(eq(adminUserRoles.adminUserId, administrator.id), eq(permissions.code, permissionCode))).limit(1);
  if (!allowed[0]) { await writeAuditLog({ actorId: administrator.id, action: "permission.denied", resourceType: "permission", resourceId: permissionCode, result: "denied" }); throw new Error("您没有执行此操作的权限。"); }
  return administrator;
}
