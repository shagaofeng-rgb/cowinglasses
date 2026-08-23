import { desc, eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { aftersalesRequests, customers, orders } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { AfterSalesTable } from "../aftersales-table";

export default async function TicketsPage() { await requirePermission("orders.read"); const rows = await getDatabase().select({ id: aftersalesRequests.id, number: aftersalesRequests.requestNumber, type: aftersalesRequests.type, status: aftersalesRequests.status, reason: aftersalesRequests.reason, requestedAmount: aftersalesRequests.requestedAmount, createdAt: aftersalesRequests.createdAt, orderId: orders.id, orderNumber: orders.orderNumber, email: customers.email }).from(aftersalesRequests).innerJoin(orders, eq(aftersalesRequests.orderId, orders.id)).leftJoin(customers, eq(aftersalesRequests.customerId, customers.id)).orderBy(desc(aftersalesRequests.createdAt)).limit(100); return <AfterSalesTable title="售后工单" description="客户售后请求、处理状态和关联订单。退换货申请会自动归集到该列表。" rows={rows}/>; }
