import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/db/client";
import { adminUserRoles, adminUsers, permissions, rolePermissions, roles } from "@/db/schema";

const permissionRows = [
  ["dashboard.read", "查看数据概览", "dashboard"],
  ["orders.read", "查看订单", "orders"], ["orders.create", "创建订单", "orders"], ["orders.update", "编辑订单", "orders"], ["orders.review", "审核退款与售后", "orders"], ["orders.export", "导出订单", "orders"],
  ["catalog.read", "查看商品", "catalog"], ["catalog.create", "创建商品", "catalog"], ["catalog.update", "编辑商品", "catalog"], ["catalog.delete", "删除商品", "catalog"], ["catalog.review", "审核商品", "catalog"], ["catalog.export", "导出商品", "catalog"],
  ["customers.read", "查看客户与内容", "customers"], ["customers.create", "创建客户与内容", "customers"], ["customers.update", "编辑客户与内容", "customers"], ["customers.export", "导出客户", "customers"],
  ["channels.read", "查看渠道", "channels"], ["channels.update", "配置渠道", "channels"],
  ["analytics.read", "查看分析", "analytics"], ["analytics.export", "导出分析", "analytics"],
  ["settings.read", "查看系统设置", "settings"], ["settings.manage", "管理系统设置", "settings"],
] as const;

const roleRows = [
  ["super_admin", "超级管理员", "拥有全部后台权限", true],
  ["operations", "运营", "商品、促销、内容和数据分析", true],
  ["support", "客服", "订单、客户、退款与售后处理", true],
  ["warehouse", "仓库人员", "库存、发货与物流处理", true],
] as const;

async function seed() {
  const db = getDatabase();
  await db.insert(permissions).values(permissionRows.map(([code, name, module]) => ({ code, name, module }))).onConflictDoNothing();
  await db.insert(roles).values(roleRows.map(([code, name, description, isSystem]) => ({ code, name, description, isSystem }))).onConflictDoNothing();

  const allPermissions = await db.select().from(permissions);
  const allRoles = await db.select().from(roles);
  const superAdminRole = allRoles.find((role) => role.code === "super_admin");
  if (!superAdminRole) throw new Error("未找到超级管理员角色。");

  await db.insert(rolePermissions).values(allPermissions.map((permission) => ({ roleId: superAdminRole.id, permissionId: permission.id }))).onConflictDoNothing();

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    console.info("角色与权限已初始化。跳过管理员创建：请在安全环境中设置 ADMIN_BOOTSTRAP_EMAIL 和 ADMIN_BOOTSTRAP_PASSWORD 后重新运行 db:seed。");
    return;
  }

  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const administratorId = existing[0]?.id ?? (await db.insert(adminUsers).values({
    email,
    name: process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "COWIN Glasses 超级管理员",
    passwordHash: await bcrypt.hash(password, 12),
    status: "active",
  }).returning({ id: adminUsers.id }))[0]?.id;

  if (!administratorId) throw new Error("无法创建初始管理员。");
  await db.insert(adminUserRoles).values({ adminUserId: administratorId, roleId: superAdminRole.id }).onConflictDoNothing();
  console.info(`初始管理员已就绪：${email}`);
}

seed().catch((error) => {
  console.error("后台种子数据初始化失败", error);
  process.exitCode = 1;
});
