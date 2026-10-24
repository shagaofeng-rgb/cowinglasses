import test from "node:test";
import assert from "node:assert/strict";
import { dateInputValue, getDateRange } from "./date-range";

test("Shanghai day starts on the previous UTC date, independent of host timezone", () => {
  const range = getDateRange({ range: "today" }, new Date("2026-10-23T20:00:00Z"));
  assert.equal(range.from.toISOString(), "2026-10-23T16:00:00.000Z");
  assert.equal(range.to.toISOString(), "2026-10-24T15:59:59.999Z");
  assert.equal(dateInputValue(range.from), "2026-10-24");
});
test("monthly and custom ranges respect Shanghai boundaries", () => {
  assert.equal(getDateRange({ range: "thisMonth" }, new Date("2026-10-01T01:00:00Z")).from.toISOString(), "2026-09-30T16:00:00.000Z");
  assert.equal(getDateRange({ range: "custom", from: "2026-10-01", to: "2026-10-02" }).to.toISOString(), "2026-10-02T15:59:59.999Z");
});
