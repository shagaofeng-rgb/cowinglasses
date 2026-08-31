import assert from "node:assert/strict";
import test from "node:test";
import { quoteShipping } from "./shipping";

const expectedOnePair: Record<string, number> = {
  malaysia_west: (43 + 50) / 7.2,
  malaysia_east: (65 + 50) / 7.2,
  singapore: (58 + 50) / 7.2,
  thailand: (40 + 50) / 7.2,
  vietnam: (44 + 50) / 7.2,
  taiwan: (23 + 50) / 7.2,
  australia: (70 + 50) / 7.2,
  philippines: (53 + 36 + 50) / 7.2,
  indonesia: (141 + 36 + 50) / 7.2,
  united_states: (0.5 * 150 + 28 + 50) / 7.2,
};

test("carrier fixture calculates every dedicated one-pair destination", () => {
  for (const [destination, expected] of Object.entries(expectedOnePair)) {
    const quote = quoteShipping(destination, 1);
    assert.equal(quote.status, "quoted");
    assert.ok(Math.abs(quote.totalUsd - expected) < 0.00001, destination);
  }
});

test("quantity changes weight and billing increments", () => {
  assert.ok(Math.abs(quoteShipping("taiwan", 2).totalUsd - (23 + 15 + 50) / 7.2) < 0.00001);
  assert.ok(Math.abs(quoteShipping("united_states", 2).totalUsd - (150 + 28 + 50) / 7.2) < 0.00001);
});

test("flat destinations and Brazil rules are explicit", () => {
  assert.equal(quoteShipping("france", 3).totalUsd, 20);
  assert.equal(quoteShipping("brazil", 1).status, "unavailable");
});
