import { isCronAuthorized } from "@/lib/news/cron-auth";
import { submitGoogleSitemap } from "@/lib/seo/google-search-console";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON) {
    console.error("Weekly Google sitemap submission blocked: service-account credentials are missing.");
    return Response.json({ ok: false, reason: "Google Search Console credentials are not configured." }, { status: 503 });
  }
  try {
    const result = await submitGoogleSitemap();
    console.info("Weekly Google sitemap submission accepted.", result);
    return Response.json({ ok: true, ...result });
  } catch {
    console.error("Weekly Google sitemap submission failed. Check service-account access and Google availability.");
    return Response.json({ ok: false, reason: "Google sitemap submission failed." }, { status: 502 });
  }
}
