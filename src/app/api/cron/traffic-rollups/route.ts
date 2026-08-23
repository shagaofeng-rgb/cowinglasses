import { NextRequest, NextResponse } from "next/server";
import { rebuildTrafficDailyRollups } from "@/lib/analytics/traffic";
import { purgeExpiredRawIps } from "@/lib/analytics/visit-context";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ success: false }, { status: 401 });
  try {
    await Promise.all([rebuildTrafficDailyRollups(), purgeExpiredRawIps()]);
    return NextResponse.json({ success: true, message: "Traffic rollups refreshed." });
  } catch (error) {
    console.error("Traffic rollup failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
