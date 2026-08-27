import { createHash, timingSafeEqual } from "crypto";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { customers, orders, payments } from "@/db/schema";
import { createOceanpaymentEmbeddedPayload, isOceanpaymentConfigured, oceanpaymentEnvironment } from "@/lib/commerce/oceanpayment";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(32).max(160),
  returnUrl: z.string().url().max(1200),
  email: z.string().trim().email().max(320),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  country: z.string().trim().regex(/^[A-Za-z]{2}$/).transform((value) => value.toUpperCase()),
  state: z.string().trim().max(120).optional().default("N/A"),
  city: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(400),
  postalCode: z.string().trim().max(32).optional().default("000000"),
});

function reply(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function sameToken(expected: string, supplied: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

function returnUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const allowed = host === "cowinglasses.com" || host === "www.cowinglasses.com" || host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app");
    return allowed && /^\/(en|ar|es|pt|ja|ko)\/payment-test$/.test(url.pathname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function paymentNumber() {
  return `CW-VERIFY-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function testOrderSource(token: string) {
  return `payment_test_${createHash("sha256").update(token).digest("hex").slice(0, 24)}`;
}

export async function GET(request: NextRequest) {
  if (process.env.OCEANPAYMENT_TEST_PAYMENTS_ENABLED !== "true" || !isDatabaseConfigured()) return reply(404, { success: false, error: { message: "Payment verification checkout is disabled." } });
  const configuredToken = process.env.OCEANPAYMENT_TEST_ORDER_TOKEN?.trim();
  const suppliedToken = request.nextUrl.searchParams.get("token") || "";
  if (!configuredToken || !sameToken(configuredToken, suppliedToken)) return reply(403, { success: false, error: { message: "This payment verification link is not valid." } });
  const db = getDatabase();
  const order = (await db.select({ orderNumber: orders.orderNumber, orderStatus: orders.status, paymentStatus: orders.paymentStatus, totalAmount: orders.totalAmount, currency: orders.currency, createdAt: orders.createdAt, paidAt: orders.paidAt, providerStatus: payments.status, providerReference: payments.providerReference }).from(orders).leftJoin(payments, and(eq(payments.orderId, orders.id), eq(payments.provider, "oceanpayment"))).where(eq(orders.source, testOrderSource(configuredToken))).limit(1))[0];
  return reply(200, { success: true, data: order ? { ...order, providerReference: Boolean(order.providerReference) } : null });
}

export async function POST(request: NextRequest) {
  if (process.env.OCEANPAYMENT_TEST_PAYMENTS_ENABLED !== "true") return reply(404, { success: false, error: { message: "Payment verification checkout is disabled." } });
  if (!isDatabaseConfigured() || !isOceanpaymentConfigured()) return reply(503, { success: false, error: { message: "Payment verification service is not configured." } });
  let input: z.infer<typeof schema>;
  try { input = schema.parse(await request.json()); } catch { return reply(400, { success: false, error: { message: "Please complete the verification billing details." } }); }
  const configuredToken = process.env.OCEANPAYMENT_TEST_ORDER_TOKEN?.trim();
  if (!configuredToken || !sameToken(configuredToken, input.token)) return reply(403, { success: false, error: { message: "This payment verification link is not valid." } });
  const backUrl = returnUrl(input.returnUrl);
  if (!backUrl) return reply(400, { success: false, error: { message: "Invalid payment return address." } });

  const source = testOrderSource(configuredToken);
  const db = getDatabase();
  const result = await db.transaction(async (tx) => {
    const existing = (await tx.select().from(orders).where(eq(orders.source, source)).limit(1))[0];
    if (existing) {
      const customer = existing.customerId ? (await tx.select().from(customers).where(eq(customers.id, existing.customerId)).limit(1))[0] : undefined;
      return { order: existing, customer };
    }
    const customer = (await tx.insert(customers).values({ email: input.email, firstName: input.firstName, lastName: input.lastName, source: "payment-verification" }).onConflictDoUpdate({ target: customers.email, set: { firstName: input.firstName, lastName: input.lastName, updatedAt: new Date() } }).returning())[0];
    const address = { country: input.country, address: input.address, city: input.city, province: input.state, postalCode: input.postalCode, paymentVerificationOnly: true };
    const order = (await tx.insert(orders).values({ orderNumber: paymentNumber(), customerId: customer.id, status: "pending_payment", paymentStatus: "pending", fulfillmentStatus: "unfulfilled", currency: "USD", subtotalAmount: "2.00", discountAmount: "0.00", shippingAmount: "0.00", taxAmount: "0.00", totalAmount: "2.00", source, shippingAddress: address, billingAddress: address, note: "Private Oceanpayment USD 2.00 verification order. No product fulfillment." }).returning())[0];
    await tx.insert(payments).values({ orderId: order.id, provider: "oceanpayment", transactionNumber: order.orderNumber, status: "pending", amount: "2.00", currency: "USD", rawPayload: { flow: "private-payment-verification", status: "created" } });
    return { order, customer };
  });
  if (!result.customer) return reply(500, { success: false, error: { message: "Unable to prepare verification customer details." } });
  const billingFirstName = result.customer.firstName || input.firstName;
  const billingLastName = result.customer.lastName || input.lastName;
  const billingEmail = result.customer.email || input.email;
  const address = result.order.billingAddress as Record<string, string>;
  const payment = createOceanpaymentEmbeddedPayload({
    order_number: result.order.orderNumber, order_currency: "USD", order_amount: "2.00", backUrl,
    billing_lastName: billingLastName, billing_firstName: billingFirstName, billing_email: billingEmail,
    billing_country: address.country, billing_state: address.province || "N/A", billing_city: address.city, billing_address: address.address, billing_zip: address.postalCode || "000000",
    billing_ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
    productName: "CoWin Glasses payment verification", productNum: "1", productSku: "COWIN-PAYMENT-VERIFY", productPrice: "2.00",
  });
  return reply(200, { success: true, data: { orderNumber: result.order.orderNumber, payment, paymentEnvironment: oceanpaymentEnvironment() } });
}
