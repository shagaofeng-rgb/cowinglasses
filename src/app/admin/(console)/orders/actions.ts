"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAuditLog } from "@/lib/admin/audit";
import { requirePermission } from "@/lib/admin/auth";
import { getDatabase } from "@/db/client";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

const orderUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending_payment", "paid", "processing", "partially_shipped", "shipped", "delivered", "cancelled", "refunded", "closed"]),
  paymentStatus: z.enum(["pending", "authorized", "paid", "failed", "cancelled", "partially_refunded", "refunded"]),
  fulfillmentStatus: z.enum(["unfulfilled", "processing", "partially_shipped", "shipped", "delivered", "exception"]),
});

export type OrderUpdateState = { success: boolean; message: string };
export const initialOrderUpdateState: OrderUpdateState = { success: false, message: "" };

export async function updateOrderStatusAction(_state: OrderUpdateState, formData: FormData): Promise<OrderUpdateState> {
  const administrator = await requirePermission("orders.update");
  const parsed = orderUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: "订单状态参数无效。" };
  const input = parsed.data;
  try {
    const [order] = await getDatabase().update(orders).set({
      status: input.status,
      paymentStatus: input.paymentStatus,
      fulfillmentStatus: input.fulfillmentStatus,
      paidAt: input.paymentStatus === "paid" ? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(orders.id, input.orderId)).returning({ id: orders.id, orderNumber: orders.orderNumber });
    if (!order) return { success: false, message: "未找到该订单。" };
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
