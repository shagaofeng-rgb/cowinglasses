"use client";

import { useActionState } from "react";
import { initialProductFormState, updateProductAction } from "@/app/admin/(console)/products/actions";

export type ProductEditValues = { id: string; skuId: string; name: string; slug: string; shortDescription: string; description: string; seoTitle: string; seoDescription: string; price: string; compareAtPrice: string; onHand: number; reorderPoint: number; status: "draft" | "active" | "archived" };

export function ProductEditForm({ product }: { product: ProductEditValues }) {
  const [state, action, pending] = useActionState(updateProductAction, initialProductFormState);
  return <form action={action} className="mt-7 grid gap-5 rounded-2xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,25,19,0.04)] md:grid-cols-2">
    <input type="hidden" name="productId" value={product.id} /><input type="hidden" name="skuId" value={product.skuId} />
    <label className="text-sm font-semibold">商品名称<input required name="name" defaultValue={product.name} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="text-sm font-semibold">商品 Slug<input required name="slug" defaultValue={product.slug} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="text-sm font-semibold">销售价（USD）<input required name="price" inputMode="decimal" defaultValue={product.price} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="text-sm font-semibold">原价（USD，可选）<input name="compareAtPrice" inputMode="decimal" defaultValue={product.compareAtPrice} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="text-sm font-semibold">当前库存<input required name="onHand" type="number" min="0" defaultValue={product.onHand} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="text-sm font-semibold">库存预警阈值<input required name="reorderPoint" type="number" min="0" defaultValue={product.reorderPoint} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="text-sm font-semibold">状态<select name="status" defaultValue={product.status} className="mt-2 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 outline-none focus:border-[#548544]"><option value="draft">草稿</option><option value="active">上架</option><option value="archived">已归档</option></select></label>
    <div className="rounded-xl bg-[#f5f7f4] p-4 text-sm leading-6 text-black/55">保存库存时会自动记录库存流水。当前编辑器修改默认 SKU；多颜色 SKU 的批量价格与库存编辑将在下一步规格管理中提供。</div>
    <label className="md:col-span-2 text-sm font-semibold">短描述<textarea name="shortDescription" rows={2} defaultValue={product.shortDescription} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="md:col-span-2 text-sm font-semibold">商品描述<textarea name="description" rows={5} defaultValue={product.description} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="text-sm font-semibold">SEO 标题<input name="seoTitle" defaultValue={product.seoTitle} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    <label className="text-sm font-semibold">SEO 描述<input name="seoDescription" defaultValue={product.seoDescription} className="mt-2 w-full rounded-xl border border-black/12 px-3 py-2.5 outline-none focus:border-[#548544]" /></label>
    {state.message ? <p role="status" className={`md:col-span-2 rounded-xl px-4 py-3 text-sm ${state.success ? "bg-[#eef8e8] text-[#376c2a]" : "bg-red-50 text-red-700"}`}>{state.message}</p> : null}
    <div className="md:col-span-2 flex justify-end"><button type="submit" disabled={pending} className="rounded-xl bg-[#17231c] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "正在保存…" : "保存并同步前台"}</button></div>
  </form>;
}
