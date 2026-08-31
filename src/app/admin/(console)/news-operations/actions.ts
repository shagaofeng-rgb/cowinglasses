"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { runNewsIngest, runNewsPublish, runNewsSourceHealth, setNewsAutomationState } from "@/lib/news/service";

async function finish(actorId: string, action: string, result: unknown) {
  await writeAuditLog({ actorId, action, resourceType: "news_automation", result: "success", metadata: { result } });
  revalidatePath("/admin/news-operations");
}

export async function updateNewsAutomationAction(formData: FormData) {
  const actor = await requirePermission("customers.update");
  const parsed = z.object({ enabled: z.enum(["true", "false"]), publishingMode: z.enum(["auto", "review"]) }).parse(Object.fromEntries(formData));
  await setNewsAutomationState({ enabled: parsed.enabled === "true", publishingMode: parsed.publishingMode, actorId: actor.id });
  await finish(actor.id, "news.automation.configure", parsed);
}

export async function runNewsIngestAction() { const actor = await requirePermission("customers.update"); const result = await runNewsIngest("manual"); await finish(actor.id, "news.automation.ingest", result); }
export async function runNewsDryRunAction() { const actor = await requirePermission("customers.update"); const result = await runNewsPublish("manual", true); await finish(actor.id, "news.automation.dry_run", result); }
export async function runNewsPublishAction() { const actor = await requirePermission("customers.update"); const result = await runNewsPublish("manual"); await finish(actor.id, "news.automation.publish", result); }
export async function runNewsSourceHealthAction() { const actor = await requirePermission("customers.update"); const result = await runNewsSourceHealth("manual"); await finish(actor.id, "news.automation.source_health", result); }
