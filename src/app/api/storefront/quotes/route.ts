import { and, count, eq, gte, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { products, productSkus, quoteRequests } from "@/db/schema";
import { locales } from "@/lib/i18n";

const requestSchema = z.object({
  requestKey: z.string().uuid(),
  locale: z.enum(locales),
  model: z.string().trim().max(260).regex(/^[a-z0-9-]*$/),
  skuId: z.union([z.literal(""), z.string().uuid()]),
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().toLowerCase().email().max(320),
  company: z.string().trim().max(160),
  destination: z.string().trim().min(2).max(120),
  quantity: z.coerce.number().int().min(1).max(100_000),
  purpose: z.enum(["personal", "team", "resale"]),
  message: z.string().trim().max(2000),
  website: z.literal(""),
});

function reply(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return reply(503, { error: "UNAVAILABLE" });
  if (request.headers.get("sec-fetch-site") === "cross-site") return reply(403, { error: "INVALID_REQUEST" });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415, { error: "INVALID_REQUEST" });

  let body: unknown;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 12_000) return reply(413, { error: "INVALID_REQUEST" });
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: "INVALID_REQUEST" });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return reply(400, { error: "INVALID_REQUEST" });
  const { requestKey, locale, name, email, company, destination, quantity, purpose, message, model, skuId } = parsed.data;

  try {
    const result = await getDatabase().transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${"quote-email:" + email}, 0))`);
      const [prior] = await tx.select({ email: quoteRequests.email, reference: quoteRequests.reference }).from(quoteRequests)
        .where(eq(quoteRequests.requestKey, requestKey));
      if (prior) return prior.email === email ? { status: 200, reference: prior.reference } : { status: 409 };
      const [recent] = await tx.select({ total: count() }).from(quoteRequests)
        .where(and(eq(quoteRequests.email, email), gte(quoteRequests.createdAt, new Date(Date.now() - 3_600_000))));
      if (recent.total >= 5) return { status: 429 };

      const [product] = model ? await tx.select({ id: products.id, name: products.name })
        .from(products).where(and(eq(products.slug, model), eq(products.status, "active"))) : [];
      if (model && !product) return { status: 400 };
      if (skuId) {
        if (!product) return { status: 400 };
        const [sku] = await tx.select({ id: productSkus.id }).from(productSkus)
          .where(and(eq(productSkus.id, skuId), eq(productSkus.productId, product.id), eq(productSkus.isActive, true)));
        if (!sku) return { status: 400 };
      }
      const reference = `RFQ-${requestKey.replaceAll("-", "").slice(0, 16).toUpperCase()}`;
      const [saved] = await tx.insert(quoteRequests).values({
        requestKey, reference, productId: product?.id, model: product?.name, skuId: skuId || null,
        locale, name, email, company, destination, quantity, purpose, message,
      }).onConflictDoNothing().returning({ reference: quoteRequests.reference });
      return saved ? { status: 201, reference: saved.reference } : { status: 409 };
    });
    if (result.status === 201) revalidateTag("admin-operating-data", { expire: 0 });
    return result.reference ? reply(result.status, { reference: result.reference }) :
      reply(result.status, { error: result.status === 429 ? "RATE_LIMIT" : "INVALID_REQUEST" });
  } catch (error) {
    console.error("Quote request could not be saved", { cause: error instanceof Error ? error.name : "Unknown" });
    return reply(503, { error: "UNAVAILABLE" });
  }
}
