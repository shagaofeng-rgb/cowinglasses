import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { storefrontEvents } from "@/db/schema";

export const runtime = "nodejs";
const schema = z.object({ eventId: z.string().min(8).max(128), eventName: z.enum(["page_view", "product_view", "add_to_cart", "begin_checkout", "order_created"]), sessionId: z.string().max(128).optional(), path: z.string().max(2000).optional(), referrer: z.string().max(2000).optional(), source: z.string().max(160).optional(), medium: z.string().max(160).optional(), campaign: z.string().max(160).optional(), metadata: z.record(z.string(), z.unknown()).optional() });
export async function POST(request: NextRequest) { if (!isDatabaseConfigured()) return NextResponse.json({ success: false, error: { code: "UNAVAILABLE" } }, { status: 503 }); try { const input = schema.parse(await request.json()); await getDatabase().insert(storefrontEvents).values({ ...input, metadata: input.metadata ?? {} }).onConflictDoNothing(); return NextResponse.json({ success: true }, { status: 202 }); } catch { return NextResponse.json({ success: false, error: { code: "INVALID_EVENT" } }, { status: 400 }); } }
