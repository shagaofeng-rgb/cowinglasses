import { and, asc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getShippingDestination, quoteShipping } from "@/config/shipping";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import {
  customers,
  coupons,
  inventoryLevels,
  inventoryMovements,
  orderItems,
  orders,
  orderAttributions,
  productSkus,
  products,
  webSessions,
  webVisitors,
} from "@/db/schema";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  lines: z.array(z.object({ skuId: z.string().uuid(), quantity: z.number().int().min(1).max(100) })).min(1).max(20),
  customer: z.object({
    email: z.string().trim().email().max(320),
    firstName: z.string().trim().min(1).max(120),
    lastName: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(3).max(64),
    acceptsMarketing: z.boolean().optional().default(false),
  }),
  shippingAddress: z.object({
    country: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(400),
    city: z.string().trim().min(1).max(120),
    province: z.string().trim().max(120).optional().default(""),
    postalCode: z.string().trim().max(32).optional().default(""),
  }),
  shippingDestinationId: z.string().trim().refine((id) => Boolean(getShippingDestination(id)), "配送目的地暂不支持。"),
  shippingMethod: z.enum(["quote", "forwarder"]),
  paymentPreference: z.enum(["card", "transfer"]),
  couponCode: z.string().trim().max(80).regex(/^[A-Za-z0-9_-]*$/, "优惠码格式不正确。").optional().default(""),
  analyticsSessionId: z.string().uuid().optional(),
  note: z.string().trim().max(2000).optional().default(""),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

function requestId() {
  return crypto.randomUUID();
}

function reply(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function asAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `CW-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const id = requestId();
  if (!isDatabaseConfigured()) {
    return reply(503, { success: false, error: { code: "DATABASE_UNAVAILABLE", message: "订单服务暂不可用，请稍后重试或联系销售。" }, requestId: id });
  }

  let payload: CheckoutInput;
  try {
    payload = checkoutSchema.parse(await request.json());
  } catch {
    return reply(400, { success: false, error: { code: "INVALID_REQUEST", message: "请完整填写联系信息、配送地址和商品数量。" }, requestId: id });
  }

  const mergedLines = Object.values(payload.lines.reduce<Record<string, { skuId: string; quantity: number }>>((result, line) => {
    result[line.skuId] = { skuId: line.skuId, quantity: (result[line.skuId]?.quantity ?? 0) + line.quantity };
    return result;
  }, {}));

  const shippingQuote = quoteShipping(
    payload.shippingDestinationId,
    mergedLines.reduce((total, line) => total + line.quantity, 0),
  );
  if (shippingQuote.status === "unavailable") {
    return reply(400, { success: false, error: { code: "SHIPPING_UNAVAILABLE", message: shippingQuote.note }, requestId: id });
  }

  try {
    const db = getDatabase();
    const order = await db.transaction(async (tx) => {
      const skuRows = await tx
        .select({ sku: productSkus, product: products })
        .from(productSkus)
        .innerJoin(products, eq(productSkus.productId, products.id))
        .where(and(inArray(productSkus.id, mergedLines.map((line) => line.skuId)), eq(productSkus.isActive, true), eq(products.status, "active")));

      if (skuRows.length !== mergedLines.length) {
        throw new CheckoutError(409, "PRODUCT_UNAVAILABLE", "购物车中有商品已下架或已更新，请返回购物车刷新后再提交。");
      }

      const items = mergedLines.map((line) => {
        const row = skuRows.find((item) => item.sku.id === line.skuId);
        if (!row) throw new CheckoutError(409, "PRODUCT_UNAVAILABLE", "商品信息已更新，请返回购物车刷新后再提交。");
        const unitCents = Math.round(Number(row.sku.price) * 100);
        if (!Number.isSafeInteger(unitCents) || unitCents < 0) throw new CheckoutError(500, "PRICE_INVALID", "商品价格暂不可用，请联系销售。");
        return { ...line, row, unitCents };
      });

      const inventoryRows = await tx.select().from(inventoryLevels).where(inArray(inventoryLevels.skuId, mergedLines.map((line) => line.skuId)));
      for (const item of items) {
        const level = inventoryRows.find((entry) => entry.skuId === item.skuId);
        if (level && level.onHand - level.reserved < item.quantity) {
          throw new CheckoutError(409, "INSUFFICIENT_STOCK", `${item.row.product.name} 库存不足，请减少数量或联系销售。`);
        }
      }

      const existingCustomer = await tx.select().from(customers).where(eq(customers.email, payload.customer.email)).limit(1);
      const customer = existingCustomer[0]
        ? (await tx.update(customers).set({
            firstName: payload.customer.firstName,
            lastName: payload.customer.lastName,
            phone: payload.customer.phone,
            acceptsMarketing: payload.customer.acceptsMarketing,
            updatedAt: new Date(),
          }).where(eq(customers.id, existingCustomer[0].id)).returning({ id: customers.id }))[0]
        : (await tx.insert(customers).values({
            email: payload.customer.email,
            firstName: payload.customer.firstName,
            lastName: payload.customer.lastName,
            phone: payload.customer.phone,
            source: "storefront",
            acceptsMarketing: payload.customer.acceptsMarketing,
          }).returning({ id: customers.id }))[0];

      const subtotalCents = items.reduce((total, item) => total + item.unitCents * item.quantity, 0);
      let discountCents = 0;
      const couponCode = payload.couponCode.toUpperCase();
      if (couponCode) {
        const now = new Date();
        const coupon = (await tx.select().from(coupons).where(and(eq(coupons.code, couponCode), eq(coupons.isActive, true), or(sql`${coupons.startsAt} is null`, lte(coupons.startsAt, now)), or(sql`${coupons.endsAt} is null`, gte(coupons.endsAt, now)))).limit(1))[0];
        if (!coupon || (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) || (coupon.minimumAmount !== null && subtotalCents < Math.round(Number(coupon.minimumAmount) * 100))) throw new CheckoutError(409, "COUPON_INVALID", "优惠码无效、已过期或未满足使用条件。");
        discountCents = coupon.discountType === "percentage" ? Math.round(subtotalCents * Number(coupon.discountValue) / 100) : Math.round(Number(coupon.discountValue) * 100);
        discountCents = Math.max(0, Math.min(discountCents, subtotalCents));
        await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1`, updatedAt: now }).where(eq(coupons.id, coupon.id));
      }
      const shippingAddress = {
        ...payload.shippingAddress,
        shippingMethod: payload.shippingMethod,
        shippingDestinationId: shippingQuote.destinationId,
        shippingQuote: {
          totalCny: shippingQuote.totalCny,
          totalUsd: shippingQuote.totalUsd,
          actualWeightKg: shippingQuote.actualWeightKg,
          chargeableWeightKg: shippingQuote.chargeableWeightKg,
          volumetricDivisor: shippingQuote.volumetricDivisor,
        },
      };
      const shippingCents = Math.round(shippingQuote.totalUsd * 100);
      const orderNumber = makeOrderNumber();
      const created = await tx.insert(orders).values({
        orderNumber,
        customerId: customer.id,
        status: "pending_payment",
        paymentStatus: "pending",
        fulfillmentStatus: "unfulfilled",
        currency: "USD",
        subtotalAmount: asAmount(subtotalCents),
        discountAmount: asAmount(discountCents),
        shippingAmount: asAmount(shippingCents),
        totalAmount: asAmount(subtotalCents - discountCents + shippingCents),
        shippingAddress,
        billingAddress: shippingAddress,
        note: [
          payload.note,
          `Payment preference: ${payload.paymentPreference}`,
          `Shipping estimate: ${shippingQuote.destinationLabel} · USD ${shippingQuote.totalUsd.toFixed(2)} · ¥${shippingQuote.totalCny.toFixed(2)}`,
          couponCode ? `Coupon: ${couponCode}` : "",
        ].filter(Boolean).join("\n"),
      }).returning({ id: orders.id, orderNumber: orders.orderNumber });

      if (payload.analyticsSessionId) {
        const visitSession = (await tx.select().from(webSessions).where(eq(webSessions.clientSessionId, payload.analyticsSessionId)).limit(1))[0];
        if (visitSession) {
          const firstSession = (await tx.select().from(webSessions).where(eq(webSessions.visitorId, visitSession.visitorId)).orderBy(asc(webSessions.startedAt)).limit(1))[0];
          await tx.update(webVisitors).set({ customerId: customer.id, updatedAt: new Date() }).where(eq(webVisitors.id, visitSession.visitorId));
          await tx.insert(orderAttributions).values({
            orderId: created[0].id,
            customerId: customer.id,
            visitorId: visitSession.visitorId,
            firstSource: firstSession?.source,
            firstMedium: firstSession?.medium,
            firstCampaign: firstSession?.campaign,
            lastSource: visitSession.source,
            lastMedium: visitSession.medium,
            lastCampaign: visitSession.campaign,
            countryCode: visitSession.countryCode,
          }).onConflictDoNothing();
        }
      }

      await tx.insert(orderItems).values(items.map((item) => ({
        orderId: created[0].id,
        skuId: item.row.sku.id,
        productName: item.row.product.name,
        skuCode: item.row.sku.sku,
        quantity: item.quantity,
        unitPrice: asAmount(item.unitCents),
        totalAmount: asAmount(item.unitCents * item.quantity),
        snapshot: { productSlug: item.row.product.slug, optionValueIds: item.row.sku.optionValueIds },
      })));

      for (const item of items) {
        const level = inventoryRows.find((entry) => entry.skuId === item.skuId);
        if (!level) continue;
        await tx.update(inventoryLevels).set({ reserved: level.reserved + item.quantity, updatedAt: new Date() }).where(eq(inventoryLevels.id, level.id));
        await tx.insert(inventoryMovements).values({
          skuId: item.skuId,
          type: "reservation",
          quantityDelta: -item.quantity,
          referenceType: "order",
          referenceId: created[0].id,
          note: `Storefront order ${created[0].orderNumber} reservation`,
        });
      }

      return created[0];
    });

    return reply(201, { success: true, data: { orderNumber: order.orderNumber, orderId: order.id, paymentStatus: "pending", requiresSalesConfirmation: true }, requestId: id });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return reply(error.status, { success: false, error: { code: error.code, message: error.message }, requestId: id });
    }
    console.error("Storefront order creation failed", { requestId: id, error });
    return reply(500, { success: false, error: { code: "ORDER_CREATE_FAILED", message: "订单暂未创建成功，请稍后重试或联系销售。" }, requestId: id });
  }
}

class CheckoutError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}
