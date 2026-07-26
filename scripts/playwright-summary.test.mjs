import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { buildSummary, formatDuration } = require("../.github/scripts/playwright-pr-summary.cjs");

test("compact Playwright summary presents the passing quality gate", () => {
  const body = buildSummary({
    results: {
      summary: {
        tests: 9,
        passed: 9,
        failed: 0,
        pending: 0,
        skipped: 0,
        other: 0,
        start: 1_000,
        stop: 13_500,
      },
      tests: [
        {
          name: "the observatory exposes a stable accessible structure",
          flaky: false,
        },
      ],
    },
  }, {
    repository: "devcamos/reality-orbit",
    runId: "12345",
  });

  assert.match(body, /Playwright Quality Gate passed/);
  assert.match(body, /9 of 9 passed/);
  assert.match(body, /0 flaky/);
  assert.match(body, /1 accessibility journey/);
  assert.match(body, /github\.com\/devcamos\/reality-orbit\/actions\/runs\/12345/);
});

test("compact Playwright summary makes unexpected results fail the quality gate", () => {
  const body = buildSummary({
    results: {
      summary: {
        tests: 2,
        passed: 1,
        failed: 1,
        pending: 0,
        skipped: 0,
        other: 0,
        start: 1_000,
        stop: 62_000,
      },
      tests: [],
    },
  }, {
    repository: "devcamos/reality-orbit",
    runId: "12345",
  });

  assert.match(body, /Playwright Quality Gate failed/);
  assert.match(body, /1 failed/);
  assert.match(body, /1m 1s test duration/);
});

test("duration formatting stays readable at short and minute-scale intervals", () => {
  assert.equal(formatDuration(12_400), "12s");
  assert.equal(formatDuration(125_000), "2m 5s");
});
