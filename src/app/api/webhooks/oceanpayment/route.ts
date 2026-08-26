import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { orders, payments, webhookEvents } from "@/db/schema";
import { parseOceanpaymentNotification, redactOceanpaymentNotification, verifyOceanpaymentNotification } from "@/lib/commerce/oceanpayment";

export const runtime = "nodejs";

function text(status: number, value: string) {
  return new NextResponse(value, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) return text(503, "database-unavailable");
  const notification = parseOceanpaymentNotification(await request.text());
  if (!notification) return text(400, "invalid-payload");
  const signatureValid = verifyOceanpaymentNotification(notification);
  const payload = redactOceanpaymentNotification(notification);
  const db = getDatabase();
  const inserted = await db.insert(webhookEvents).values({
    provider: "oceanpayment",
    externalEventId: notification.payment_id.slice(0, 200),
    eventType: "transaction",
    signatureValid,
    payload,
    processingError: signatureValid ? null : "Oceanpayment signValue validation failed.",
  }).onConflictDoNothing().returning({ id: webhookEvents.id });

  if (!signatureValid) return text(401, "invalid-signature");
  if (!inserted.length) return text(200, "receive-ok");
  // Browser returns are never a source of truth. Only Oceanpayment's server-to-server
  // notification (response_type=1) is allowed to change payment and order state.
  if (notification.response_type !== "1") {
    await db.update(webhookEvents).set({ processedAt: new Date(), processingError: "Browser return saved; awaiting asynchronous notification." }).where(eq(webhookEvents.id, inserted[0].id));
    return text(200, "receive-ok");
  }

  const orderAmount = Number(notification.order_amount);
  if (!Number.isFinite(orderAmount) || orderAmount < 0 || notification.order_currency !== "USD") {
    await db.update(webhookEvents).set({ processingError: "Invalid Oceanpayment amount or currency." }).where(eq(webhookEvents.id, inserted[0].id));
    return text(400, "invalid-order");
  }

  await db.transaction(async (tx) => {
    const payment = (await tx.select().from(payments).where(and(eq(payments.provider, "oceanpayment"), eq(payments.transactionNumber, notification.order_number))).limit(1))[0];
    if (!payment || Number(payment.amount).toFixed(2) !== orderAmount.toFixed(2) || payment.currency !== notification.order_currency) {
      await tx.update(webhookEvents).set({ processingError: "Payment record, amount or currency did not match the Oceanpayment notice." }).where(eq(webhookEvents.id, inserted[0].id));
      return;
    }
    const status = notification.payment_status === "1" ? "paid" : notification.payment_status === "0" ? "failed" : "pending";
    const paidAt = status === "paid" ? new Date() : null;
    await tx.update(payments).set({ status, providerReference: notification.payment_id, rawPayload: payload, paidAt, updatedAt: new Date() }).where(eq(payments.id, payment.id));
    if (status === "paid") {
      await tx.update(orders).set({ status: "paid", paymentStatus: "paid", paidAt, updatedAt: new Date() }).where(eq(orders.id, payment.orderId));
    } else if (status === "failed") {
      await tx.update(orders).set({ paymentStatus: "failed", updatedAt: new Date() }).where(eq(orders.id, payment.orderId));
    }
    await tx.update(webhookEvents).set({ processedAt: new Date(), processingError: null }).where(eq(webhookEvents.id, inserted[0].id));
  });
  return text(200, "receive-ok");
}
