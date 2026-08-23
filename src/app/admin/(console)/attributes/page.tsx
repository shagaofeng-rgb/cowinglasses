import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDatabase } from "@/db/client";
import { productOptions, productOptionValues, products } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";

export default async function AttributesPage() {
  await requirePermission("catalog.read");
  const [options, values] = await Promise.all([
    getDatabase().select({ id: productOptions.id, productId: productOptions.productId, name: productOptions.name, position: productOptions.position, productName: products.name }).from(productOptions).innerJoin(products, eq(productOptions.productId, products.id)).orderBy(asc(products.name), asc(productOptions.position)),
    getDatabase().select({ optionId: productOptionValues.optionId, value: productOptionValues.value, swatchValue: productOptionValues.swatchValue, position: productOptionValues.position }).from(productOptionValues).orderBy(asc(productOptionValues.position)),
  ]);
  const byOption = new Map<string, typeof values>(); for (const value of values) byOption.set(value.optionId, [...(byOption.get(value.optionId) ?? []), value]);
  return <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10"><h1 className="font-serif text-4xl font-bold">规格与属性</h1><p className="mt-2 text-sm text-black/55">展示已发布到前台的产品选项和颜色/规格值。现有商品的属性来源于本地产品资料并已同步到 SKU。</p><section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#f5f7f4]"><tr><th className="p-4">商品</th><th className="p-4">选项</th><th className="p-4">属性值</th><th className="p-4">操作</th></tr></thead><tbody>{options.length ? options.map((option) => <tr key={option.id} className="border-t border-black/8"><td className="p-4 font-bold">{option.productName}</td><td className="p-4">{option.name}</td><td className="p-4"><div className="flex flex-wrap gap-2">{(byOption.get(option.id) ?? []).map((value) => <span key={`${option.id}-${value.value}`} className="rounded-full border border-black/10 px-2.5 py-1 text-xs">{value.swatchValue ? <i className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: value.swatchValue }} /> : null}{value.value}</span>)}</div></td><td className="p-4"><Link href={`/admin/products/${option.productId}`} className="rounded-lg border border-black/15 px-3 py-2 text-xs font-bold">编辑商品</Link></td></tr>) : <tr><td colSpan={4} className="p-14 text-center text-black/55">暂无商品属性。请在商品编辑器中维护 SKU 与颜色选项。</td></tr>}</tbody></table></section></main>;
}
