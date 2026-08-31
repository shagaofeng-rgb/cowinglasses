import { and, eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import {
  coupons,
  inventoryLevels,
  inventoryMovements,
  orderItems,
  orders,
  payments,
  webhookEvents,
} from "@/db/schema";
import {
  parseOceanpaymentNotification,
  redactOceanpaymentNotification,
  verifyOceanpaymentNotification,
} from "@/lib/commerce/oceanpayment";

export const runtime = "nodejs";

function text(status: number, value: string) {
  return new NextResponse(value, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) return text(503, "database-unavailable");
  const notification = parseOceanpaymentNotification(await request.text());
  if (!notification) return text(400, "invalid-payload");
  const signatureValid = verifyOceanpaymentNotification(notification);
  const payload = redactOceanpaymentNotification(notification);
  const db = getDatabase();
  const inserted = await db
    .insert(webhookEvents)
    .values({
      provider: "oceanpayment",
      externalEventId: notification.payment_id.slice(0, 200),
      eventType: "transaction",
      signatureValid,
      payload,
      processingError: signatureValid
        ? null
        : "Oceanpayment signValue validation failed.",
    })
    .onConflictDoNothing()
    .returning({ id: webhookEvents.id, processedAt: webhookEvents.processedAt });

  if (!signatureValid) return text(401, "invalid-signature");
  const existingEvent =
    inserted[0] ??
    (
      await db
        .select({
          id: webhookEvents.id,
          processedAt: webhookEvents.processedAt,
        })
        .from(webhookEvents)
        .where(
          and(
            eq(webhookEvents.provider, "oceanpayment"),
            eq(
              webhookEvents.externalEventId,
              notification.payment_id.slice(0, 200),
            ),
          ),
        )
        .limit(1)
    )[0];
  if (!existingEvent) return text(503, "retry-later");
  if (existingEvent.processedAt) return text(200, "receive-ok");
  const eventId = existingEvent.id;
  if (!inserted.length)
    await db
      .update(webhookEvents)
      .set({ signatureValid: true, payload, processingError: null })
      .where(eq(webhookEvents.id, eventId));
  // Browser returns are never a source of truth. Only Oceanpayment's server-to-server
  // notification (response_type=1) is allowed to change payment and order state.
  if (notification.response_type !== "1") {
    await db
      .update(webhookEvents)
      .set({
        processedAt: new Date(),
        processingError:
          "Browser return saved; awaiting asynchronous notification.",
      })
      .where(eq(webhookEvents.id, eventId));
    return text(200, "receive-ok");
  }

  const orderAmount = Number(notification.order_amount);
  if (
    !Number.isFinite(orderAmount) ||
    orderAmount < 0 ||
    notification.order_currency !== "USD"
  ) {
    await db
      .update(webhookEvents)
      .set({ processingError: "Invalid Oceanpayment amount or currency." })
      .where(eq(webhookEvents.id, eventId));
    return text(400, "invalid-order");
  }

  const processed = await db.transaction(async (tx) => {
    const payment = (
      await tx
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.provider, "oceanpayment"),
            eq(payments.transactionNumber, notification.order_number),
          ),
        )
        .limit(1)
    )[0];
    if (
      !payment ||
      Number(payment.amount).toFixed(2) !== orderAmount.toFixed(2) ||
      payment.currency !== notification.order_currency
    ) {
      await tx
        .update(webhookEvents)
        .set({
          processingError:
            "Payment record, amount or currency did not match the Oceanpayment notice.",
        })
        .where(eq(webhookEvents.id, eventId));
      return false;
    }
    const status =
      notification.payment_status === "1"
        ? "paid"
        : notification.payment_status === "0"
          ? "failed"
          : "pending";
    const paidAt = status === "paid" ? new Date() : null;
    const order = (
      await tx
        .select()
        .from(orders)
        .where(eq(orders.id, payment.orderId))
        .limit(1)
    )[0];
    if (!order) {
      await tx
        .update(webhookEvents)
        .set({ processingError: "The associated order no longer exists." })
        .where(eq(webhookEvents.id, eventId));
      return false;
    }
    await tx
      .update(payments)
      .set({
        status,
        providerReference: notification.payment_id,
        rawPayload: payload,
        paidAt,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));
    if (status === "paid") {
      await tx
        .update(orders)
        .set({
          status: "paid",
          paymentStatus: "paid",
          paidAt,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, payment.orderId));
      if (order.paymentStatus !== "paid" && order.couponId)
        await tx
          .update(coupons)
          .set({
            usedCount: sql`${coupons.usedCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(coupons.id, order.couponId));
    } else if (status === "failed") {
      await tx
        .update(orders)
        .set({ paymentStatus: "failed", updatedAt: new Date() })
        .where(eq(orders.id, payment.orderId));
      const alreadyReleased = (
        await tx
          .select({ id: inventoryMovements.id })
          .from(inventoryMovements)
          .where(
            and(
              eq(inventoryMovements.referenceType, "order"),
              eq(inventoryMovements.referenceId, payment.orderId),
              eq(inventoryMovements.type, "release"),
            ),
          )
          .limit(1)
      )[0];
      if (!alreadyReleased) {
        const items = await tx
          .select({ skuId: orderItems.skuId, quantity: orderItems.quantity })
          .from(orderItems)
          .where(eq(orderItems.orderId, payment.orderId));
        const skuIds = items.flatMap((item) =>
          item.skuId ? [item.skuId] : [],
        );
        const levels = skuIds.length
          ? await tx
              .select()
              .from(inventoryLevels)
              .where(inArray(inventoryLevels.skuId, skuIds))
          : [];
        for (const item of items) {
          if (!item.skuId) continue;
          const level = levels.find((entry) => entry.skuId === item.skuId);
          if (!level) continue;
          await tx
            .update(inventoryLevels)
            .set({
              reserved: sql`greatest(0, ${inventoryLevels.reserved} - ${item.quantity})`,
              updatedAt: new Date(),
            })
            .where(eq(inventoryLevels.id, level.id));
          await tx
            .insert(inventoryMovements)
            .values({
              skuId: item.skuId,
              type: "release",
              quantityDelta: item.quantity,
              referenceType: "order",
              referenceId: payment.orderId,
              note: `Released after failed Oceanpayment transaction ${payment.transactionNumber}`,
            });
        }
      }
    }
    await tx
      .update(webhookEvents)
      .set({ processedAt: new Date(), processingError: null })
      .where(eq(webhookEvents.id, eventId));
    return true;
  });
  if (!processed) return text(503, "retry-later");
  return text(200, "receive-ok");
}
