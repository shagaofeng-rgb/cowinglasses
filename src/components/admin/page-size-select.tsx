import { ADMIN_PAGE_SIZES, type AdminPageSize } from "@/lib/admin/pagination";

type Props = {
  value: number;
  name?: string;
  sizes?: readonly AdminPageSize[];
  label?: string;
};

/** Shared control so every bounded admin list exposes the same page-size rule. */
export function PageSizeSelect({ value, name = "pageSize", sizes = ADMIN_PAGE_SIZES, label = "每页条数" }: Props) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-black/60">
      {label}
      <select name={name} defaultValue={value} className="rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-black">
        {sizes.map((size) => <option key={size} value={size}>{size} 条</option>)}
      </select>
    </label>
  );
}
