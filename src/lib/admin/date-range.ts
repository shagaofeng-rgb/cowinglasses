export type DatePreset = "today" | "yesterday" | "week" | "month" | "thisMonth" | "custom";
export type DateRange = { preset: DatePreset; from: Date; to: Date };

const presets: DatePreset[] = ["today", "yesterday", "week", "month", "thisMonth", "custom"];

function dayStart(value: Date) {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
}

function dayEnd(value: Date) {
  const result = new Date(value);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getDateRange(input: { range?: string; from?: string; to?: string }): DateRange {
  const now = new Date();
  const requested = input.range;
  const preset = presets.includes(requested as DatePreset) ? requested as DatePreset : "today";

  if (preset === "custom" && input.from && input.to) {
    const from = new Date(`${input.from}T00:00:00`);
    const to = new Date(`${input.to}T23:59:59.999`);
    if (!Number.isNaN(from.valueOf()) && !Number.isNaN(to.valueOf()) && from <= to) {
      return { preset, from, to };
    }
  }

  const from = dayStart(now);
  let to = dayEnd(now);

  if (preset === "yesterday") {
    from.setDate(from.getDate() - 1);
    to = dayEnd(from);
  }
  if (preset === "week") from.setDate(from.getDate() - 6);
  if (preset === "month") from.setDate(from.getDate() - 29);
  if (preset === "thisMonth") from.setDate(1);

  return { preset: preset === "custom" ? "today" : preset, from, to };
}

export function dateRangeQuery(range: DateRange) {
  return { range: range.preset, from: dateInputValue(range.from), to: dateInputValue(range.to) };
}

export function dateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
