"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { runGoogleSitemapJob } from "@/lib/seo/google-sitemap-job";

export async function submitSitemapNow() {
  const admin = await requirePermission("settings.manage");
  const result = await runGoogleSitemapJob("admin");
  await writeAuditLog({ actorId: admin.id, resourceType: "sitemap", action: "google.sitemap.submit", result: result.ok ? "success" : "failure" });
  revalidatePath("/admin/sync");
  return result.ok ? `Google 已接收站点地图。HTTP ${result.receipt.httpStatus}` : result.reason;
}
