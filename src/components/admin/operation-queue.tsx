import { and, count, eq, isNull, ne } from "drizzle-orm";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getDatabase } from "@/db/client";
import { inventoryLevels, orders, products, productSkus, quoteRequests } from "@/db/schema";

const queue = {
  stock: { permission: "catalog.read", label: "库存待核实", href: "/admin/inventory?status=pending" },
  quotes: { permission: "customers.read", label: "询价待跟进", href: "/admin/quotes?status=new" },
  payments: { permission: "orders.read", label: "订单待付款", href: "/admin/orders?queue=payment" },
  shipments: { permission: "orders.read", label: "已付款待发货", href: "/admin/orders?queue=shipping" },
  exceptions: { permission: "orders.read", label: "履约异常", href: "/admin/orders?queue=exception" },
};

const getCounts = unstable_cache(async () => {
  const db = getDatabase();
  const [[stock], [quotes], [payments], [shipments], [exceptions]] = await Promise.all([
    db.select({ total: count() }).from(productSkus).innerJoin(products, eq(products.id, productSkus.productId))
      .leftJoin(inventoryLevels, and(eq(inventoryLevels.skuId, productSkus.id), eq(inventoryLevels.locationCode, "default")))
      .where(and(eq(products.status, "active"), eq(productSkus.isActive, true), isNull(inventoryLevels.verifiedAt))),
    db.select({ total: count() }).from(quoteRequests).where(eq(quoteRequests.status, "new")),
    db.select({ total: count() }).from(orders).where(and(eq(orders.status, "pending_payment"), eq(orders.paymentStatus, "pending"))),
    db.select({ total: count() }).from(orders).where(and(eq(orders.status, "paid"), eq(orders.paymentStatus, "paid"), ne(orders.fulfillmentStatus, "exception"))),
    db.select({ total: count() }).from(orders).where(eq(orders.fulfillmentStatus, "exception")),
  ]);
  return { stock: stock.total, quotes: quotes.total, payments: payments.total, shipments: shipments.total, exceptions: exceptions.total };
}, ["admin-action-queue"], { revalidate: 30, tags: ["admin-operating-data"] });

export async function OperationQueue({ permissions }: { permissions: string[] }) {
  const visible = (Object.keys(queue) as (keyof typeof queue)[]).filter((key) => permissions.includes(queue[key].permission));
  if (!visible.length) return null;
  const counts = await getCounts();
  return <section className="mt-6" aria-labelledby="admin-queue-title">
    <h2 id="admin-queue-title" className="font-serif text-2xl font-bold">运营待办</h2>
    <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">{visible.map((key) => <Link key={key} href={queue[key].href}
      className="min-w-0 rounded-2xl border border-black/10 bg-white p-4 hover:border-[#538a42] focus-visible:outline-2 focus-visible:outline-[#538a42]">
      <span className="block text-xs font-semibold text-black/65">{queue[key].label}</span>
      <strong className="mt-2 block text-2xl font-bold tabular-nums">{counts[key]}</strong>
    </Link>)}</div>
  </section>;
}
