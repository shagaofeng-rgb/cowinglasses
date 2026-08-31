import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/news/cron-auth";
import { runNewsPublish } from "@/lib/news/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return NextResponse.json({ success: false }, { status: 401 });
  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
  const result = await runNewsPublish("cron", dryRun);
  console.info("[news-publish]", JSON.stringify(result));
  return NextResponse.json({ success: true, data: result });
}
