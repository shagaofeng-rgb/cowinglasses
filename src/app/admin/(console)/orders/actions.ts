"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { writeAuditLog } from "@/lib/admin/audit";
import { requirePermission } from "@/lib/admin/auth";
import { getDatabase } from "@/db/client";
import { inventoryMovements, orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";

import { settleOrderStock } from "@/lib/commerce/stock";
import { storeCatalogueTag } from "@/data/repositories/products";

const orderUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending_payment", "paid", "processing", "partially_shipped", "shipped", "delivered", "cancelled", "refunded", "closed"]),
  paymentStatus: z.enum(["pending", "authorized", "paid", "failed", "cancelled", "partially_refunded", "refunded"]),
  fulfillmentStatus: z.enum(["unfulfilled", "processing", "partially_shipped", "shipped", "delivered", "exception"]),
});

export type OrderUpdateState = { success: boolean; message: string };
export async function updateOrderStatusAction(_state: OrderUpdateState, formData: FormData): Promise<OrderUpdateState> {
  const administrator = await requirePermission("orders.update");
  const parsed = orderUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: "订单状态参数无效。" };
  const input = parsed.data;
  try {
    const result = await getDatabase().transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, input.orderId)).for("update");
      if (!order) return { error: "未找到该订单。" };

      const cancelled = ["cancelled", "closed", "refunded"].includes(input.status) ||
        ["failed", "cancelled", "refunded"].includes(input.paymentStatus);
      const shipped = ["shipped", "delivered"].includes(input.fulfillmentStatus);
      if (shipped && !["paid", "partially_refunded", "refunded"].includes(input.paymentStatus)) {
        return { error: "请确认收款后再更新发货状态。" };
      }
      const [released] = await tx.select({ id: inventoryMovements.id }).from(inventoryMovements).where(and(
        eq(inventoryMovements.referenceType, "order"),
        eq(inventoryMovements.referenceId, order.id), eq(inventoryMovements.type, "release"),
      )).limit(1);
      if (released && (!cancelled || shipped) && input.fulfillmentStatus !== "exception") {
        return { error: "库存已释放。若迟到付款，请保留异常状态并先人工复核。" };
      }
      if (order.paidAt && ["pending", "authorized", "failed", "cancelled"].includes(input.paymentStatus)) {
        return { error: "已收款订单只能保留收款或进入退款状态。" };
      }
      if (cancelled && !shipped) await settleOrderStock(tx, order.id, "release");
      if (shipped) await settleOrderStock(tx, order.id, "outbound");

      await tx.update(orders).set({
        status: input.status,
        paymentStatus: input.paymentStatus,
        fulfillmentStatus: input.fulfillmentStatus,
        paidAt: order.paidAt ?? (input.paymentStatus === "paid" ? new Date() : null),
        updatedAt: new Date(),
      }).where(eq(orders.id, order.id));
      return { order };
    });
    if (!result.order) return { success: false, message: result.error };
    const { order } = result;
    updateTag(storeCatalogueTag);
    updateTag("admin-operating-data");
    await writeAuditLog({ actorId: administrator.id, action: "orders.status.update", resourceType: "order", resourceId: order.id, result: "success", metadata: { orderNumber: order.orderNumber, ...input } });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);
    return { success: true, message: "订单状态已保存。" };
  } catch (error) {
    console.error("订单状态更新失败", error);
    await writeAuditLog({ actorId: administrator.id, action: "orders.status.update", resourceType: "order", resourceId: input.orderId, result: "failure" });
    return { success: false, message: "保存失败，请稍后重试。" };
  }
}
