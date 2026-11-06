import { isCronAuthorized } from "@/lib/news/cron-auth";
import { runGoogleSitemapJob } from "@/lib/seo/google-sitemap-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!isCronAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  const result = await runGoogleSitemapJob("cron");
  return Response.json(result, { status: result.ok ? 200 : result.step === "credentials" ? 503 : 502, headers });
}
