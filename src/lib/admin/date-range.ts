export type DatePreset = "today" | "week" | "month" | "custom";
export type DateRange = { preset: DatePreset; from: Date; to: Date };

export function getDateRange(input: { range?: string; from?: string; to?: string }): DateRange {
  const now = new Date(); const end = new Date(now); end.setHours(23, 59, 59, 999);
  const preset = ["today", "week", "month", "custom"].includes(input.range ?? "") ? input.range as DatePreset : "month";
  if (preset === "custom" && input.from && input.to) { const from = new Date(`${input.from}T00:00:00`); const to = new Date(`${input.to}T23:59:59.999`); if (!Number.isNaN(from.valueOf()) && !Number.isNaN(to.valueOf()) && from <= to) return { preset, from, to }; }
  const from = new Date(now); from.setHours(0, 0, 0, 0); if (preset === "week") from.setDate(from.getDate() - 6); if (preset === "month") from.setDate(from.getDate() - 29); return { preset: preset === "custom" ? "month" : preset, from, to: end };
}

export function dateRangeQuery(range: DateRange) { return { range: range.preset, from: dateInputValue(range.from), to: dateInputValue(range.to) }; }

export function dateInputValue(value: Date) {
  const year = value.getFullYear(); const month = String(value.getMonth() + 1).padStart(2, "0"); const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
