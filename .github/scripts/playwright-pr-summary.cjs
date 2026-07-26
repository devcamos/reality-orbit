const { readFile } = require("node:fs/promises");

const COMMENT_MARKER = "<!-- reality-orbit-playwright-compact -->";
const REPORT_PATH = "ctrf/playwright-report.json";

const asCount = (value) => Number.isFinite(value) ? value : 0;

const formatDuration = (milliseconds) => {
  const seconds = Math.max(0, Math.round(asCount(milliseconds) / 1000));
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
};

const buildSummary = (report, { repository, runId }) => {
  const results = report?.results ?? {};
  const summary = results.summary ?? {};
  const tests = Array.isArray(results.tests) ? results.tests : [];
  const total = asCount(summary.tests);
  const passed = asCount(summary.passed);
  const failed = asCount(summary.failed);
  const pending = asCount(summary.pending);
  const skipped = asCount(summary.skipped);
  const other = asCount(summary.other);
  const flaky = tests.filter((test) => test?.flaky === true).length;
  const accessibilityJourneys = tests.filter((test) =>
    /accessib/i.test(String(test?.name ?? ""))).length;
  const unexpected = failed + pending + other;
  const gatePassed = total > 0 && unexpected === 0;
  const gateIcon = gatePassed ? "✅" : "❌";
  const gateLabel = gatePassed ? "passed" : "failed";
  const runUrl = `https://github.com/${repository}/actions/runs/${runId}`;
  const duration = formatDuration(asCount(summary.stop) - asCount(summary.start));

  return [
    COMMENT_MARKER,
    `## ${gateIcon} Playwright Quality Gate ${gateLabel}`,
    "",
    "---",
    "",
    "### Journeys",
    `${passed === total ? "✅" : "🟡"} ${passed} of ${total} passed`,
    `${failed === 0 ? "✅" : "❌"} ${failed} failed`,
    `${flaky === 0 ? "✅" : "🟡"} ${flaky} flaky`,
    `${skipped === 0 ? "✅" : "🟡"} ${skipped} skipped`,
    "",
    "### Measures",
    `${accessibilityJourneys > 0 ? "✅" : "🟡"} ${accessibilityJourneys} accessibility journey`,
    "✅ Chromium desktop coverage",
    `⏱️ ${duration} test duration`,
    "",
    `[View the workflow, HTML report, traces and screenshots](${runUrl})`,
    "",
    "_Compact comparison view generated from the same CTRF result as the standard report._",
  ].join("\n");
};

const publishSummary = async ({ core, context, github }) => {
  const pullRequestNumber = context.payload.pull_request?.number;
  if (!pullRequestNumber) {
    core.notice("Compact Playwright reporting only runs for pull requests.");
    return;
  }

  let report;
  try {
    report = JSON.parse(await readFile(REPORT_PATH, "utf8"));
  } catch (error) {
    core.notice(`No CTRF report was available at ${REPORT_PATH}: ${error.message}`);
    return;
  }

  const body = buildSummary(report, {
    repository: `${context.repo.owner}/${context.repo.repo}`,
    runId: process.env.GITHUB_RUN_ID,
  });
  const comments = await github.paginate(github.rest.issues.listComments, {
    ...context.repo,
    issue_number: pullRequestNumber,
    per_page: 100,
  });
  const existing = comments.find((comment) => comment.body?.includes(COMMENT_MARKER));

  if (existing) {
    await github.rest.issues.updateComment({
      ...context.repo,
      comment_id: existing.id,
      body,
    });
    return;
  }

  await github.rest.issues.createComment({
    ...context.repo,
    issue_number: pullRequestNumber,
    body,
  });
};

module.exports = {
  buildSummary,
  formatDuration,
  publishSummary,
};
