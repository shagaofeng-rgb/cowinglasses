import postgres from "postgres";

const marker = process.argv[2]?.trim();
if (!marker?.startsWith("TEST-AUDIT-")) throw new Error("A TEST-AUDIT-* marker is required.");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
  try {
    const result = await sql.begin(async (tx) => {
    const targetOrders = await tx<{ id: string }[]>`select id from orders where note like ${`%${marker}%`} for update`;
    const orderIds = targetOrders.map((row) => row.id);
    if (orderIds.length) {
      await tx`update inventory_levels as levels set reserved = greatest(0, levels.reserved - reserved_items.quantity), updated_at = now() from (select sku_id, sum(quantity)::integer as quantity from order_items where order_id = any(${orderIds}::uuid[]) and sku_id is not null group by sku_id) as reserved_items where levels.sku_id = reserved_items.sku_id`;
      await tx`delete from inventory_movements where reference_type = 'order' and reference_id = any(${orderIds}::text[])`;
      await tx`delete from order_attributions where order_id = any(${orderIds}::uuid[])`;
      await tx`delete from refunds where order_id = any(${orderIds}::uuid[])`;
      await tx`delete from payments where order_id = any(${orderIds}::uuid[])`;
      await tx`delete from orders where id = any(${orderIds}::uuid[])`;
    }
    const deletedCustomers = await tx<{ id: string }[]>`delete from customers where first_name = 'TEST-AUDIT' and email like 'codex-audit-%@example.com' returning id`;
    return { orders: orderIds.length, customers: deletedCustomers.length };
    });
    console.info(`Cleaned marked commerce test data: ${result.orders} order(s), ${result.customers} customer(s).`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
