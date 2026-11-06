import { createHash } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { storeCatalogueTag } from "@/data/repositories/products";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { coupons, inventoryMovements, orders, payments, webhookEvents } from "@/db/schema";
import {
  parseOceanpaymentNotification,
  redactOceanpaymentNotification,
  verifyOceanpaymentNotification,
} from "@/lib/commerce/oceanpayment";
import { settleOrderStock } from "@/lib/commerce/stock";

export const runtime = "nodejs";

function text(status: number, value: string) {
  return new NextResponse(value, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) return text(503, "database-unavailable");
  const notification = parseOceanpaymentNotification(await request.text());
  if (!notification) return text(400, "invalid-payload");
  if (!verifyOceanpaymentNotification(notification)) return text(401, "invalid-signature");
  // Only authenticated server-to-server notifications can change payment state.
  if (notification.response_type !== "1") return text(200, "receive-ok");

  const orderAmount = Number(notification.order_amount);
  if (!/^\d+(?:\.\d{1,2})?$/.test(notification.order_amount) || !Number.isFinite(orderAmount) || orderAmount < 0 || notification.order_currency !== "USD") {
    return text(400, "invalid-order");
  }
  const status = notification.payment_status === "1" ? "paid" : notification.payment_status === "0" ? "failed" : "pending";
  const eventKey = createHash("sha256").update(JSON.stringify([
    notification.order_number, notification.payment_id, notification.payment_status,
  ])).digest("hex");
  const payload = redactOceanpaymentNotification(notification);
  try {
    const result = await getDatabase().transaction(async (tx) => {
      const [candidate] = await tx.select({ id: payments.id, orderId: payments.orderId })
        .from(payments).where(and(eq(payments.provider, "oceanpayment"),
          eq(payments.transactionNumber, notification.order_number))).limit(1);
      if (!candidate) return null;

      const [order] = await tx.select().from(orders).where(eq(orders.id, candidate.orderId)).for("update");
      const [payment] = await tx.select().from(payments).where(eq(payments.id, candidate.id)).for("update");
      if (!order || !payment || Number(payment.amount).toFixed(2) !== orderAmount.toFixed(2) ||
        payment.currency !== notification.order_currency) return null;

      const [event] = await tx.insert(webhookEvents).values({
        provider: "oceanpayment", externalEventId: eventKey, eventType: "transaction",
        signatureValid: true, payload,
      }).onConflictDoNothing().returning({ id: webhookEvents.id });
      if (!event) return { released: false };

      let released = false;
      const finalPayment = [payment.status, order.paymentStatus].some((value) =>
        value === "paid" || value === "partially_refunded" || value === "refunded");
      const failedPayment = order.paymentStatus === "failed" || order.paymentStatus === "cancelled";
      const closedOrder = order.status === "cancelled" || order.status === "closed" || order.status === "refunded";
      const now = new Date();
      if (!finalPayment && status !== "pending") {
        await tx.update(payments).set({
          status, providerReference: notification.payment_id, rawPayload: payload,
          paidAt: status === "paid" ? now : payment.paidAt, updatedAt: now,
        }).where(eq(payments.id, payment.id));
        if (status === "paid") {
          const [reservation] = order.source === "storefront" ? await tx.select({ id: inventoryMovements.id })
            .from(inventoryMovements).where(and(eq(inventoryMovements.referenceType, "order"),
              eq(inventoryMovements.referenceId, order.id), eq(inventoryMovements.type, "reservation"))).limit(1) : [];
          const noAllocation = order.source === "storefront" && !reservation;
          await tx.update(orders).set({
            status: closedOrder ? order.status : "paid",
            paymentStatus: "paid", paidAt: order.paidAt ?? now, updatedAt: now,
            fulfillmentStatus: failedPayment || closedOrder || noAllocation ? "exception" : order.fulfillmentStatus,
          }).where(eq(orders.id, order.id));
          if (order.couponId) {
            await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1`, updatedAt: now })
              .where(eq(coupons.id, order.couponId));
          }
        } else if (!closedOrder) {
          await tx.update(orders).set({ paymentStatus: "failed", updatedAt: now }).where(eq(orders.id, order.id));
          released = await settleOrderStock(tx, order.id, "release");
        }
      }

      await tx.update(webhookEvents).set({ processedAt: now }).where(eq(webhookEvents.id, event.id));
      return { released };
    });
    if (!result) return text(503, "retry-later");
    revalidateTag("admin-operating-data", { expire: 0 });
    if (result.released) revalidateTag(storeCatalogueTag, { expire: 0 });
    return text(200, "receive-ok");
  } catch (error) {
    console.error("Oceanpayment notification processing failed.", { cause: error instanceof Error ? error.name : "Unknown" });
    return text(503, "retry-later");
  }
}
