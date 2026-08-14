import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const REQUIRED_SECTION_HEADINGS = [
  "The mistake is treating every uncertain moment alike",
  "When evidence is absent, begin with honest uncertainty",
  "One attempt is not a verdict",
  "Repeated attempts reveal the process",
  "Some choices use up what remains",
  "Frequency is a system-health signal",
  "Time changes the kind of preparation you need",
  "Average is useful, but the tail can decide the outcome",
  "Small samples and unexpected variation deserve investigation",
  "Update belief, do not defend it",
  "A decision sequence for uncertain situations",
  "Probability has a moral boundary",
  "Use the map",
];

const note = JSON.parse(
  await readFile(
    new URL("../src/lib/field-notes/probability-is-a-language-for-uncertainty.json", import.meta.url),
    "utf8",
  ),
);

test("probability Field Note metadata maps to the Model node", () => {
  assert.equal(note.slug, "probability-is-a-language-for-uncertainty");
  assert.equal(note.title, "Probability is a language for uncertainty");
  assert.equal(note.dimension, "Category");
  assert.equal(note.category, "Knowledge");
  assert.equal(note.subcategory, "Model");
  assert.equal(note.primaryNodeId, "model");
  assert.equal(note.date, "2026-08-14");
  assert.deepEqual(note.tags, ["Probability", "Decision making", "Uncertainty", "Models"]);
  assert.match(note.summary, /does not promise control/i);
});

test("probability Field Note keeps the required uncertainty-pattern sections", () => {
  const headings = note.sections.map((section) => section.heading);
  assert.deepEqual(headings, REQUIRED_SECTION_HEADINGS);

  for (const section of note.sections) {
    assert.equal(typeof section.body, "string");
    assert.ok(section.body.trim().length > 40, `Section "${section.heading}" needs teaching body copy`);
  }

  const decisionSequence = note.sections.find((section) => section.heading === "A decision sequence for uncertain situations");
  assert.ok(decisionSequence);
  assert.match(decisionSequence.body, /one attempt or a repeated process/i);
  assert.match(decisionSequence.body, /renewable or finite/i);
  assert.match(decisionSequence.body, /rare extreme outcome/i);
  assert.match(decisionSequence.body, /evidence would genuinely change/i);
});

test("probability Field Note preserves the moral boundary and Model CTA intent", () => {
  const moral = note.sections.find((section) => section.heading === "Probability has a moral boundary");
  const useTheMap = note.sections.find((section) => section.heading === "Use the map");

  assert.ok(moral);
  assert.match(moral.body, /not merely samples/i);
  assert.match(moral.body, /moral responsibility/i);
  assert.match(moral.body, /does not.*promise control|not promise control/i);

  assert.ok(useTheMap);
  assert.match(useTheMap.body, /\bModel\b/);
  assert.match(useTheMap.body, /not reality itself/i);
});
