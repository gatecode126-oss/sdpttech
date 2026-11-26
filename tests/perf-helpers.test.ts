import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldPoll, shouldRefreshOnVisible } from "../src/lib/polling.ts";

test("polling is skipped for hidden tabs", () => {
  assert.equal(shouldPoll({ hidden: true, inFlight: false }), false);
});
test("polling is skipped while a request is in flight", () => {
  assert.equal(shouldPoll({ hidden: false, inFlight: true }), false);
});
test("polling runs for a visible, idle tab", () => {
  assert.equal(shouldPoll({ hidden: false, inFlight: false }), true);
});
test("refresh on visible only when data is at least one interval old", () => {
  assert.equal(shouldRefreshOnVisible(10_000, 1_000, 15_000), false);
  assert.equal(shouldRefreshOnVisible(16_000, 1_000, 15_000), true);
});
