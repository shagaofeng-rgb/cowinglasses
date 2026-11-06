import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { inventoryLevels, products, productSkus } from "@/db/schema";
import { getAdminPermissionCodes, requirePermission } from "@/lib/admin/auth";
import { StockCountForm } from "./stock-count-form";

export default async function StockCountPage({ params }: { params: Promise<{ skuId: string }> }) {
  const admin = await requirePermission("catalog.read");
  const { skuId } = await params;
  if (!z.string().uuid().safeParse(skuId).success) notFound();
  const [row] = await getDatabase().select({ sku: productSkus, product: products.name, level: inventoryLevels })
    .from(productSkus).innerJoin(products, eq(products.id, productSkus.productId))
    .leftJoin(inventoryLevels, and(eq(inventoryLevels.skuId, productSkus.id), eq(inventoryLevels.locationCode, "default")))
    .where(eq(productSkus.id, skuId));
  if (!row) notFound();
  const canEdit = (await getAdminPermissionCodes(admin.id)).includes("catalog.update");
  const { level } = row;
  return <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8">
    <Link href="/admin/inventory" className="text-sm font-bold text-[#3e7230]">← 返回库存管理</Link>
    <h1 className="mt-5 font-serif text-3xl font-bold sm:text-4xl">核对库存</h1>
    <p className="mt-2 text-black/65">{row.product} · <span className="font-mono">{row.sku.sku}</span></p>
    <p className="mt-4 text-sm">{level?.verifiedAt ? `最近确认 ${level.verifiedAt.toISOString().slice(0, 16).replace("T", " ")} UTC` : "此仓位库存待核实"} · 已预留 {level?.reserved ?? 0} 件</p>
    <p className="mt-3 text-sm text-black/65">默认仓。实物盘点数量包含已预留件数，前台只销售扣除预留后的数量。</p>
    {canEdit && <StockCountForm skuId={skuId} onHand={level?.onHand ?? 0} reorderPoint={level?.reorderPoint ?? 0} />}
  </div>;
}
