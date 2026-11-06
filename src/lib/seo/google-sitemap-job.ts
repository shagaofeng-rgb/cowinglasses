import "server-only";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { syncJobs } from "@/db/schema";
import { GoogleSitemapError, submitGoogleSitemap } from "./google-search-console";

export const googleSitemapJobType = "google_search_console";

export async function runGoogleSitemapJob(trigger: "cron" | "admin") {
  const startedAt = new Date();
  const job = await submitGoogleSitemap().then(
    (receipt) => ({ ok: true as const, receipt }),
    (error: unknown) => ({
      ok: false as const,
      reason: error instanceof GoogleSitemapError ? error.message : "Google Sitemap job failed.",
      step: error instanceof GoogleSitemapError ? error.step : "unknown",
    }),
  );
  if (job.ok) console.info("Google accepted CoWin sitemap submission.", { trigger, ...job.receipt });
  else console.error("CoWin sitemap submission failed.", { trigger, reason: job.reason });

  if (isDatabaseConfigured()) {
    try {
      await getDatabase().insert(syncJobs).values({
        type: googleSitemapJobType, status: job.ok ? "succeeded" : "failed", requestPayload: { trigger },
        result: job.ok ? job.receipt : { step: job.step },
        errorMessage: job.ok ? null : job.reason, startedAt, finishedAt: new Date(),
      });
    } catch {
      console.error("The Google Sitemap receipt could not be stored.", { trigger });
    }
  }
  return job;
}
