import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/news/cron-auth";
import { runNewsIngest } from "@/lib/news/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return NextResponse.json({ success: false }, { status: 401 });
  const result = await runNewsIngest("cron");
  console.info("[news-ingest]", JSON.stringify(result));
  return NextResponse.json({ success: true, data: result });
}
