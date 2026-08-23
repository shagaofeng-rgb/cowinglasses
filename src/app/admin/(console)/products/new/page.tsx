import Link from "next/link";
import { ProductCreateForm } from "@/app/admin/(console)/products/new/product-create-form";
import { requirePermission } from "@/lib/admin/auth";

export default async function NewProductPage() {
  await requirePermission("catalog.create");
  return <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 lg:px-10"><Link href="/admin/products" className="text-sm font-bold text-[#477b38]">← 返回商品管理</Link><p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#538a42]">商品与库存</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em]">新建商品</h1><p className="mt-2 text-sm leading-6 text-black/55">创建商品时会在同一个数据库事务中建立首个 SKU 和初始库存。</p><ProductCreateForm /></div>;
}
