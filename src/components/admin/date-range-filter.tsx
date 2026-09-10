"use client";

import { useState } from "react";
import { dateInputValue, type DatePreset, type DateRange } from "@/lib/admin/date-range";

type Props = {
  range: DateRange;
  preserve?: Record<string, string | undefined>;
  className?: string;
};

const quickRanges: Array<{ value: Exclude<DatePreset, "custom">; label: string }> = [
  { value: "today", label: "今天" },
  { value: "yesterday", label: "昨天" },
  { value: "week", label: "近 7 天" },
  { value: "month", label: "近 30 天" },
  { value: "thisMonth", label: "本月" },
];

/** Shared date filter for every operational list and report. */
export function DateRangeFilter({ range, preserve = {}, className = "" }: Props) {
  const [preset, setPreset] = useState<DatePreset>(range.preset);
  const isCustom = preset === "custom";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {Object.entries(preserve).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold uppercase tracking-[.12em] text-black/45">数据范围</span>
        {quickRanges.map((item) => {
          const active = preset === item.value;
          return (
            <button
              key={item.value}
              type="submit"
              name="range"
              value={item.value}
              onClick={() => setPreset(item.value)}
              className={`rounded-full border px-3.5 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#a6c947] focus:ring-offset-2 ${
                active
                  ? "border-[#17231c] bg-[#17231c] text-white shadow-sm"
                  : "border-black/10 bg-white text-black/60 hover:border-[#80a943] hover:bg-[#f4f8ed] hover:text-[#315f28]"
              }`}
            >
              {active && item.value === "today" ? <span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#b9e64b]" /> : null}
              {item.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setPreset("custom")}
          className={`rounded-full border px-3.5 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#a6c947] focus:ring-offset-2 ${
            isCustom
              ? "border-[#17231c] bg-[#17231c] text-white shadow-sm"
              : "border-black/10 bg-white text-black/60 hover:border-[#80a943] hover:bg-[#f4f8ed] hover:text-[#315f28]"
          }`}
        >
          自定义 <span aria-hidden="true">▾</span>
        </button>
      </div>
      {isCustom ? (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-[#d7e8bc] bg-[#f7faef] p-2.5">
          <input type="hidden" name="range" value="custom" />
          <label className="grid gap-1 text-xs font-semibold text-black/60">
            开始日期
            <input aria-label="开始日期" type="date" name="from" required defaultValue={dateInputValue(range.from)} className="rounded-lg border border-black/12 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#548544]" />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-black/60">
            结束日期
            <input aria-label="结束日期" type="date" name="to" required defaultValue={dateInputValue(range.to)} className="rounded-lg border border-black/12 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#548544]" />
          </label>
          <button type="submit" className="rounded-lg bg-[#17231c] px-3 py-2 text-sm font-bold text-white hover:bg-[#284033]">应用筛选</button>
        </div>
      ) : null}
    </div>
  );
}
