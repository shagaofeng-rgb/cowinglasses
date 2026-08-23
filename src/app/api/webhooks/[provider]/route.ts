import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { webhookEvents } from "@/db/schema";
import { webhookSecretFor } from "@/lib/commerce/providers/config";

export const runtime = "nodejs";

function verifySignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  const supplied = signature.replace(/^sha256=/, "");
  const expectedBuffer = Buffer.from(expected, "hex");
  const suppliedBuffer = Buffer.from(supplied, "hex");
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: rawProvider } = await params;
  const provider = rawProvider.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const eventId = request.headers.get("x-provider-event-id")?.slice(0, 200) || crypto.randomUUID();
  const body = await request.text();
  const secret = webhookSecretFor(provider);
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, error: { code: "DATABASE_UNAVAILABLE", message: "Webhook 存储不可用。" } }, { status: 503 });
  if (!secret) return NextResponse.json({ success: false, error: { code: "WEBHOOK_UNCONFIGURED", message: "Webhook 密钥未配置。" } }, { status: 503 });

  const signatureValid = verifySignature(body, request.headers.get("x-cowin-signature"), secret);
  let payload: Record<string, unknown> = {};
  try { payload = JSON.parse(body) as Record<string, unknown>; } catch { payload = { rawBody: body.slice(0, 10000) }; }
  const db = getDatabase();
  await db.insert(webhookEvents).values({ provider, externalEventId: eventId, eventType: String(payload.type ?? payload.eventType ?? "unknown").slice(0, 128), signatureValid, payload, processingError: signatureValid ? "事件已保存，等待服务商事件映射配置。" : "HMAC 签名校验失败。" }).onConflictDoNothing();
  if (!signatureValid) return NextResponse.json({ success: false, error: { code: "INVALID_SIGNATURE", message: "签名校验失败。" } }, { status: 401 });
  return NextResponse.json({ success: true, data: { accepted: true, processed: false } }, { headers: { "Cache-Control": "no-store" } });
}
