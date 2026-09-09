import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { orderItems, orders } from "@/db/schema";
import { getCustomerSession } from "@/lib/customer/auth";

export const runtime = "nodejs";

function reply(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  if (!isDatabaseConfigured())
    return reply(503, { success: false, error: "database-unavailable" });

  const { orderNumber } = await params;
  if (!/^CW-\d{8}-[A-F0-9]{8}$/.test(orderNumber))
    return reply(404, { success: false, error: "not-found" });

  const customer = await getCustomerSession();
  if (!customer) return reply(401, { success: false, error: "unauthorized" });

  const db = getDatabase();
  const order = (
    await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        paymentStatus: orders.paymentStatus,
        totalAmount: orders.totalAmount,
        currency: orders.currency,
      })
      .from(orders)
      .where(
        and(
          eq(orders.orderNumber, orderNumber),
          eq(orders.customerId, customer.customerId),
        ),
      )
      .limit(1)
  )[0];

  if (!order) return reply(404, { success: false, error: "not-found" });
  if (order.paymentStatus !== "paid")
    return reply(200, {
      success: true,
      data: { status: order.paymentStatus === "failed" ? "failed" : "pending" },
    });

  const items = await db
    .select({
      sku: orderItems.skuCode,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return reply(200, {
    success: true,
    data: {
      status: "paid",
      orderNumber: order.orderNumber,
      value: Number(order.totalAmount),
      currency: order.currency,
      contents: items.map((item) => ({
        id: item.sku,
        quantity: item.quantity,
        item_price: Number(item.unitPrice),
      })),
    },
  });
}
