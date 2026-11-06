import Link from "next/link";

export default function AdminAccessDenied() {
  return <section className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
    <h1 className="font-serif text-3xl font-bold">权限不足</h1>
    <p className="mt-3 text-sm text-black/65">请通过导航选择当前角色可访问的工作区。需要额外权限时，请联系店铺管理员。</p>
    <Link href="/en" className="mt-5 inline-block font-semibold text-[#3e7230] underline">查看商城</Link>
  </section>;
}
