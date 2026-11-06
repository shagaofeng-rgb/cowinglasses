import Link from "next/link";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  href: (page: number) => string;
  label?: string;
  className?: string;
};

/** Server-rendered pagination so large operational tables never load all rows. */
export function TablePagination({ page, pageSize, total, href, label = "条", className = "" }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const hasRows = total > 0 && page <= pageCount;
  const start = hasRows ? (page - 1) * pageSize + 1 : 0;
  const end = hasRows ? Math.min(page * pageSize, total) : 0;
  return <nav aria-label="列表分页" className={`flex flex-col gap-3 border-t border-black/8 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between ${className}`}><span aria-live="polite">显示 {start}–{end} / 共 {total} {label} · 第 {page} / {pageCount} 页</span><div className="flex gap-2"><Link aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} href={href(Math.max(1, Math.min(pageCount, page - 1)))} className="rounded-lg border border-black/12 px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-40">上一页</Link><Link aria-disabled={page >= pageCount} tabIndex={page >= pageCount ? -1 : undefined} href={href(Math.min(pageCount, page + 1))} className="rounded-lg border border-black/12 px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-40">下一页</Link></div></nav>;
}
