import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeRegex } from "../src/lib/utils.ts";

test("escapeRegex neutralises regex metacharacters", () => {
  const input = "(a+)+$ .*[x]\\";
  const re = new RegExp(escapeRegex(input));
  assert.ok(re.test(input));
  assert.equal(new RegExp(escapeRegex("a.c")).test("abc"), false);
});
