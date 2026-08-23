import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured } from "@/db/client";
import { createTrackedEvent } from "@/lib/analytics/visit-context";

export const runtime = "nodejs";
const schema = z.object({ eventId: z.string().min(8).max(128), eventName: z.enum(["page_view", "product_view", "add_to_cart", "begin_checkout", "order_created"]), sessionId: z.string().uuid().max(128).optional(), path: z.string().max(2000).optional(), referrer: z.string().max(2000).optional(), source: z.string().max(160).optional(), medium: z.string().max(160).optional(), campaign: z.string().max(160).optional(), productId: z.string().uuid().optional(), orderId: z.string().uuid().optional(), metadata: z.record(z.string(), z.unknown()).optional() });

function requestIp(request: NextRequest) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim();
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, error: { code: "UNAVAILABLE" } }, { status: 503 });
  try {
    const input = schema.parse(await request.json());
    const sessionId = input.sessionId ?? crypto.randomUUID();
    const context = await createTrackedEvent({
      eventId: input.eventId,
      eventName: input.eventName,
      clientSessionId: sessionId,
      path: input.path,
      referrer: input.referrer,
      source: input.source,
      medium: input.medium,
      campaign: input.campaign,
      productId: input.productId,
      orderId: input.orderId,
      metadata: input.metadata,
      userAgent: request.headers.get("user-agent") ?? undefined,
      ip: requestIp(request),
      countryCode: request.headers.get("x-vercel-ip-country") ?? undefined,
    }, request.cookies.get("cowin_visitor")?.value);
    const response = NextResponse.json({ success: true, data: { visitNumber: context.visitNumber } }, { status: 202 });
    response.cookies.set("cowin_visitor", context.visitorToken, { httpOnly: true, maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return response;
  } catch (error) {
    console.error("Storefront analytics event rejected", error);
    return NextResponse.json({ success: false, error: { code: "INVALID_EVENT" } }, { status: 400 });
  }
}
