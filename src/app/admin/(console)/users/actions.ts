"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { adminUserRoles, adminUsers } from "@/db/schema";
import { writeAuditLog } from "@/lib/admin/audit";
import { requirePermission } from "@/lib/admin/auth";

export type UserFormState = { success: boolean; message: string };
export const initialUserFormState: UserFormState = { success: false, message: "" };
const schema = z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320), password: z.string().min(12, "密码至少需要 12 位。"), roleId: z.string().uuid() });

export async function createAdminUserAction(_state: UserFormState, formData: FormData): Promise<UserFormState> {
  const actor = await requirePermission("settings.manage");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "请填写完整管理员资料。" };
  try {
    const value = parsed.data;
    const [created] = await getDatabase().insert(adminUsers).values({ email: value.email.toLowerCase(), name: value.name, passwordHash: await bcrypt.hash(value.password, 12), status: "active" }).returning({ id: adminUsers.id });
    if (!created) throw new Error("create_failed");
    await getDatabase().insert(adminUserRoles).values({ adminUserId: created.id, roleId: value.roleId });
    await writeAuditLog({ actorId: actor.id, action: "settings.admin_user.create", resourceType: "admin_user", resourceId: created.id, result: "success" });
    revalidatePath("/admin/users");
    return { success: true, message: "管理员已创建并分配角色。" };
  } catch (error) {
    console.error("admin-user-create", error);
    await writeAuditLog({ actorId: actor.id, action: "settings.admin_user.create", resourceType: "admin_user", result: "failure" });
    return { success: false, message: "创建失败，该账号可能已存在。" };
  }
}
