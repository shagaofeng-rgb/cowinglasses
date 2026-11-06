import "server-only";
import { and, asc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import type { getDatabase } from "@/db/client";
import { inventoryLevels, inventoryMovements, orderItems } from "@/db/schema";

type Transaction = Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0];
type StockLine = { skuId: string; quantity: number };

export class StockUnavailable extends Error {
  constructor(public readonly code: "INVENTORY_UNCONFIRMED" | "INSUFFICIENT_STOCK") {
    super(code);
  }
}

/** Each line ships from one confirmed location. Lock in a stable order across carts. */
export async function reserveStock(tx: Transaction, lines: StockLine[]) {
  const levels = await tx.select().from(inventoryLevels)
    .where(and(inArray(inventoryLevels.skuId, lines.map((line) => line.skuId)), isNotNull(inventoryLevels.verifiedAt)))
    .orderBy(asc(inventoryLevels.skuId), asc(inventoryLevels.id))
    .for("update");
  const reservations = new Map<string, string>();
  for (const line of lines) {
    const locations = levels.filter((level) => level.skuId === line.skuId);
    if (!locations.length) throw new StockUnavailable("INVENTORY_UNCONFIRMED");
    const chosen = locations.find((level) => level.onHand - level.reserved >= line.quantity);
    if (!chosen) throw new StockUnavailable("INSUFFICIENT_STOCK");

    const [reserved] = await tx.update(inventoryLevels)
      .set({ reserved: sql`${inventoryLevels.reserved} + ${line.quantity}`, updatedAt: new Date() })
      .where(and(eq(inventoryLevels.id, chosen.id), sql`${inventoryLevels.onHand} - ${inventoryLevels.reserved} >= ${line.quantity}`))
      .returning({ id: inventoryLevels.id });
    if (!reserved) throw new StockUnavailable("INSUFFICIENT_STOCK");
    reservations.set(line.skuId, reserved.id);
  }
  return reservations;
}

/** The caller locks the order row before settling the recorded allocations. */
export async function settleOrderStock(tx: Transaction, orderId: string, type: "release" | "outbound") {
  const [settled] = await tx.select({ id: inventoryMovements.id }).from(inventoryMovements)
    .where(and(
      eq(inventoryMovements.referenceType, "order"),
      eq(inventoryMovements.referenceId, orderId),
      or(eq(inventoryMovements.type, "release"), eq(inventoryMovements.type, "outbound")),
    )).limit(1);
  if (settled) return false;

  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const allocated = items.flatMap((item) => {
    const levelId = item.snapshot.inventoryLevelId;
    return item.skuId && typeof levelId === "string" ? [{ levelId, skuId: item.skuId, quantity: item.quantity }] : [];
  }).sort((a, b) => a.skuId.localeCompare(b.skuId) || a.levelId.localeCompare(b.levelId));

  for (const item of allocated) {
    const [updated] = await tx.update(inventoryLevels)
      .set({
        reserved: sql`${inventoryLevels.reserved} - ${item.quantity}`,
        ...(type === "outbound" ? { onHand: sql`${inventoryLevels.onHand} - ${item.quantity}` } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(inventoryLevels.id, item.levelId), eq(inventoryLevels.skuId, item.skuId),
        sql`${inventoryLevels.reserved} >= ${item.quantity}`,
        type === "outbound" ? sql`${inventoryLevels.onHand} >= ${item.quantity}` : undefined))
      .returning({ id: inventoryLevels.id });
    if (!updated) throw new Error("Order stock allocation requires reconciliation.");
    await tx.insert(inventoryMovements).values({
      skuId: item.skuId,
      type,
      quantityDelta: type === "release" ? item.quantity : -item.quantity,
      referenceType: "order",
      referenceId: orderId,
      note: type === "release" ? "Released the recorded order allocation" : "Dispatched the recorded order allocation",
    });
  }
  return allocated.length > 0;
}
