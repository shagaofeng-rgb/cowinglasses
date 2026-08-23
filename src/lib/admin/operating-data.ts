import { and, desc, eq, gte, lte } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDatabase } from "@/db/client";
import { aftersalesRequests, inventoryLevels, orders, products, productSkus, refunds } from "@/db/schema";

export const getOperatingSnapshot = unstable_cache(async (fromIso: string, toIso: string) => {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const db = getDatabase();
  const [paid, orderRows, refundRows, lowStock, aftersales] = await Promise.all([
    db.select({ total: orders.totalAmount, createdAt: orders.createdAt }).from(orders).where(and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, from), lte(orders.createdAt, to))),
    db.select({ id: orders.id, createdAt: orders.createdAt }).from(orders).where(and(gte(orders.createdAt, from), lte(orders.createdAt, to))),
    db.select({ amount: refunds.amount }).from(refunds).where(and(gte(refunds.createdAt, from), lte(refunds.createdAt, to))),
    db.select({ sku: productSkus.sku, name: products.name, onHand: inventoryLevels.onHand, reserved: inventoryLevels.reserved, reorderPoint: inventoryLevels.reorderPoint }).from(inventoryLevels).innerJoin(productSkus, eq(inventoryLevels.skuId, productSkus.id)).innerJoin(products, eq(productSkus.productId, products.id)).where(lte(inventoryLevels.onHand, inventoryLevels.reorderPoint)).orderBy(desc(inventoryLevels.updatedAt)).limit(5),
    db.select({ id: aftersalesRequests.id }).from(aftersalesRequests).where(eq(aftersalesRequests.status, "requested")),
  ]);
  return { paid, orderRows, refundRows, lowStock, pendingAftersales: aftersales.length };
}, ["admin-operating-snapshot"], { revalidate: 30, tags: ["admin-operating-data"] });
