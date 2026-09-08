import Link from "next/link";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  href: (page: number) => string;
  label?: string;
};

/** Server-rendered pagination so large operational tables never load all rows. */
export function TablePagination({ page, pageSize, total, href, label = "条" }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return <div className="flex flex-col gap-3 border-t border-black/8 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"><span>显示 {start}–{end} / 共 {total} {label} · 第 {page} / {pageCount} 页</span><div className="flex gap-2"><Link aria-disabled={page <= 1} href={href(Math.max(1, page - 1))} className="rounded-lg border border-black/12 px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-40">上一页</Link><Link aria-disabled={page >= pageCount} href={href(Math.min(pageCount, page + 1))} className="rounded-lg border border-black/12 px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-40">下一页</Link></div></div>;
}
