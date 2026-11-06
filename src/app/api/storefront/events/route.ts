import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured } from "@/db/client";
import { createTrackedEvent } from "@/lib/analytics/visit-context";

export const runtime = "nodejs";
const metadataSchema = z.record(z.string(), z.unknown()).optional().refine((value) => !value || JSON.stringify(value).length <= 5_000, "metadata is too large");
const schema = z.object({ eventId: z.string().min(8).max(128), eventName: z.enum(["page_view", "product_view", "add_to_cart", "begin_checkout", "order_created", "engagement", "scroll_depth"]), sessionId: z.string().uuid().max(128).optional(), path: z.string().max(2000).optional(), referrer: z.string().max(2000).optional(), source: z.string().max(160).optional(), medium: z.string().max(160).optional(), campaign: z.string().max(160).optional(), utmContent: z.string().max(160).optional(), utmTerm: z.string().max(160).optional(), productId: z.string().uuid().optional(), orderId: z.string().uuid().optional(), metadata: metadataSchema });

function requestIp(request: NextRequest) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim();
}

export function DELETE(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return new NextResponse(null, { status: 403 });
  const response = new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  response.cookies.delete("cowin_visitor");
  return response;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site" || request.cookies.get("cowin_analytics_consent")?.value !== "granted") {
    return new NextResponse(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
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
      metadata: { ...input.metadata, utmContent: input.utmContent, utmTerm: input.utmTerm },
      userAgent: request.headers.get("user-agent") ?? undefined,
      ip: requestIp(request),
      countryCode: request.headers.get("x-vercel-ip-country") ?? undefined,
    }, request.cookies.get("cowin_visitor")?.value);
    const response = NextResponse.json({ success: true, data: { visitNumber: context.visitNumber } }, { status: 202 });
    response.cookies.set("cowin_visitor", context.visitorToken, { httpOnly: true, maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return response;
  } catch (error) {
    console.error("Storefront analytics event rejected", { cause: error instanceof Error ? error.name : "Unknown" });
    const invalid = error instanceof z.ZodError || error instanceof SyntaxError;
    return NextResponse.json({ success: false, error: { code: invalid ? "INVALID_EVENT" : "EVENT_UNAVAILABLE" } }, { status: invalid ? 400 : 503 });
  }
}
