"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { writeAuditLog } from "@/lib/admin/audit";
import { requirePermission } from "@/lib/admin/auth";

export type SettingsState = { success: boolean; message: string };
export const initialSettingsState: SettingsState = { success: false, message: "" };
const schema = z.object({ storeName: z.string().trim().min(2).max(160), siteUrl: z.string().trim().url().max(500), supportEmail: z.string().trim().email().max(320), currency: z.literal("USD"), orderPrefix: z.string().trim().regex(/^[A-Z0-9-]{2,12}$/, "订单前缀仅支持大写字母、数字和连字符。") });

export async function saveStoreSettingsAction(_state: SettingsState, formData: FormData): Promise<SettingsState> {
  const actor = await requirePermission("settings.manage");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "设置内容无效。" };
  try {
    await getDatabase().insert(storeSettings).values({ key: "storefront", value: parsed.data, updatedBy: actor.id, updatedAt: new Date() }).onConflictDoUpdate({ target: storeSettings.key, set: { value: parsed.data, updatedBy: actor.id, updatedAt: new Date() } });
    await writeAuditLog({ actorId: actor.id, action: "settings.storefront.update", resourceType: "store_settings", resourceId: "storefront", result: "success" });
    revalidatePath("/admin/settings");
    return { success: true, message: "商城基础设置已保存。" };
  } catch (error) {
    console.error("store-settings-save", error);
    await writeAuditLog({ actorId: actor.id, action: "settings.storefront.update", resourceType: "store_settings", resourceId: "storefront", result: "failure" });
    return { success: false, message: "保存失败，请稍后重试。" };
  }
}
