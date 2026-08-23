import { dateInputValue, type DateRange } from "@/lib/admin/date-range";

type Props = {
  range: DateRange;
  preserve?: Record<string, string | undefined>;
  className?: string;
};

export function DateRangeFilter({ range, preserve = {}, className = "" }: Props) {
  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      {Object.entries(preserve).map(([name, value]) => value ? <input key={name} type="hidden" name={name} value={value} /> : null)}
      <label className="grid gap-1 text-xs font-semibold text-black/60">
        时间范围
        <select name="range" defaultValue={range.preset} className="rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-[#548544]">
          <option value="today">当日</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
          <option value="custom">自定义</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs font-semibold text-black/60">
        开始日期
        <input aria-label="开始日期" type="date" name="from" defaultValue={dateInputValue(range.from)} className="rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#548544]" />
      </label>
      <label className="grid gap-1 text-xs font-semibold text-black/60">
        结束日期
        <input aria-label="结束日期" type="date" name="to" defaultValue={dateInputValue(range.to)} className="rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#548544]" />
      </label>
    </div>
  );
}
