export type DatePreset = "today" | "yesterday" | "week" | "month" | "thisMonth" | "custom";
export type DateRange = { preset: DatePreset; from: Date; to: Date };

const presets: DatePreset[] = ["today", "yesterday", "week", "month", "thisMonth", "custom"];

function dayStart(value: Date) {
  return new Date(`${dateInputValue(value)}T00:00:00+08:00`);
}

function dayEnd(value: Date) {
  return new Date(dayStart(value).getTime() + 86_400_000 - 1);
}

export function getDateRange(input: { range?: string; from?: string; to?: string }, now = new Date()): DateRange {
  const requested = input.range;
  const preset = presets.includes(requested as DatePreset) ? requested as DatePreset : "today";

  if (preset === "custom" && input.from && input.to) {
    const from = new Date(`${input.from}T00:00:00+08:00`);
    const to = new Date(`${input.to}T23:59:59.999+08:00`);
    if (!Number.isNaN(from.valueOf()) && !Number.isNaN(to.valueOf()) && from <= to) {
      return { preset, from, to };
    }
  }

  let from = dayStart(now);
  let to = dayEnd(now);

  if (preset === "yesterday") {
    from = new Date(from.getTime() - 86_400_000);
    to = dayEnd(from);
  }
  if (preset === "week") from = new Date(from.getTime() - 6 * 86_400_000);
  if (preset === "month") from = new Date(from.getTime() - 29 * 86_400_000);
  if (preset === "thisMonth") from = new Date(`${dateInputValue(now).slice(0, 7)}-01T00:00:00+08:00`);

  return { preset: preset === "custom" ? "today" : preset, from, to };
}

export function dateRangeQuery(range: DateRange) {
  return { range: range.preset, from: dateInputValue(range.from), to: dateInputValue(range.to) };
}

export function dateInputValue(value: Date) {
  const local = new Date(value.getTime() + 8 * 3_600_000);
  const year = local.getUTCFullYear();
  const month = String(local.getUTCMonth() + 1).padStart(2, "0");
  const day = String(local.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
