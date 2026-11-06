import { and, count, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDatabase } from "@/db/client";
import { aftersalesRequests, inventoryLevels, orders, products, productSkus, refunds } from "@/db/schema";

export const getOperatingSnapshot = unstable_cache(async (fromIso: string, toIso: string) => {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const db = getDatabase();
  const range = and(gte(orders.createdAt, from), lte(orders.createdAt, to));
  const chartStart = new Date(Math.max(from.getTime(), to.getTime() - 14 * 86_400_000 + 1));
  const day = sql<string>`to_char(${orders.createdAt} at time zone 'Asia/Shanghai', 'YYYY-MM-DD')`;
  const [[sales], trend, [refund], lowStock, [aftersales]] = await Promise.all([
    db.select({
      orders: count(),
      paidCount: sql<number>`count(*) filter (where ${orders.paymentStatus} = 'paid')`.mapWith(Number),
      total: sql<number>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.paymentStatus} = 'paid'), 0)`.mapWith(Number),
    }).from(orders).where(range),
    db.select({ day, total: sql<number>`sum(${orders.totalAmount})`.mapWith(Number) })
      .from(orders).where(and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, chartStart), lte(orders.createdAt, to))).groupBy(day),
    db.select({ total: sql<number>`coalesce(sum(${refunds.amount}), 0)`.mapWith(Number) })
      .from(refunds).where(and(gte(refunds.createdAt, from), lte(refunds.createdAt, to))),
    db.select({ sku: productSkus.sku, name: products.name, onHand: inventoryLevels.onHand, reserved: inventoryLevels.reserved, reorderPoint: inventoryLevels.reorderPoint })
      .from(inventoryLevels).innerJoin(productSkus, eq(inventoryLevels.skuId, productSkus.id))
      .innerJoin(products, eq(productSkus.productId, products.id))
      .where(and(isNotNull(inventoryLevels.verifiedAt), eq(productSkus.isActive, true), eq(products.status, "active"),
        sql`${inventoryLevels.onHand} - ${inventoryLevels.reserved} <= ${inventoryLevels.reorderPoint}`))
      .orderBy(desc(inventoryLevels.updatedAt)).limit(5),
    db.select({ total: count() }).from(aftersalesRequests).where(eq(aftersalesRequests.status, "requested")),
  ]);
  return { sales, trend, refunds: refund.total, lowStock, pendingAftersales: aftersales.total };
}, ["admin-operating-snapshot-v2"], { revalidate: 30, tags: ["admin-operating-data"] });
