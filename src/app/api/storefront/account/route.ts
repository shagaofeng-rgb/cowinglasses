import { and, desc, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { orderItems, orders } from "@/db/schema";
import { getCustomerSession } from "@/lib/customer/auth";

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, error: { code: "DATABASE_UNAVAILABLE" } }, { status: 503 });
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ success: false, error: { code: "UNAUTHENTICATED" } }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const db = getDatabase();
  const orderRows = await db.select().from(orders).where(and(eq(orders.customerId, session.customerId), gte(orders.createdAt, session.accountCreatedAt))).orderBy(desc(orders.createdAt)).limit(100);
  const itemRows = orderRows.length ? await db.select().from(orderItems).where(eq(orderItems.orderId, orderRows[0].id)) : [];
  const itemsByOrder = new Map<string, typeof itemRows>();
  for (const order of orderRows) itemsByOrder.set(order.id, []);
  if (orderRows.length > 1) {
    const { inArray } = await import("drizzle-orm");
    const all = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderRows.map((order) => order.id)));
    for (const item of all) itemsByOrder.get(item.orderId)?.push(item);
  } else for (const item of itemRows) itemsByOrder.get(item.orderId)?.push(item);
  return NextResponse.json({ success: true, data: {
    customer: { email: session.email, firstName: session.firstName, lastName: session.lastName, phone: session.phone },
    orders: orderRows.map((order) => ({ orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, fulfillmentStatus: order.fulfillmentStatus, currency: order.currency, subtotalAmount: order.subtotalAmount, shippingAmount: order.shippingAmount, totalAmount: order.totalAmount, createdAt: order.createdAt, items: (itemsByOrder.get(order.id) ?? []).map((item) => ({ productName: item.productName, skuCode: item.skuCode, quantity: item.quantity, unitPrice: item.unitPrice, totalAmount: item.totalAmount })) })),
  } }, { headers: { "Cache-Control": "private, no-store" } });
}
