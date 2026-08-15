import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const survivalNote = JSON.parse(
  readFileSync(new URL("../src/lib/field-notes/given-chosen-and-the-path-here.json", import.meta.url), "utf8"),
);

test("Survival Field Note teaches fact, negotiable, and path without new planets", () => {
  assert.equal(survivalNote.slug, "given-chosen-and-the-path-here");
  assert.equal(survivalNote.primaryNodeId, "survival");
  assert.equal(survivalNote.category, "Knowledge");
  assert.equal(survivalNote.subcategory, "Framework");
  assert.equal(survivalNote.featured, true);

  const headings = survivalNote.sections.map((section) => section.heading);
  assert.deepEqual(headings, [
    "Keep Survival on the Knowledge shelf",
    "Fact",
    "Negotiable",
    "Path",
    "Use the map",
  ]);

  const fact = survivalNote.sections.find((section) => section.heading === "Fact");
  const negotiable = survivalNote.sections.find((section) => section.heading === "Negotiable");
  const path = survivalNote.sections.find((section) => section.heading === "Path");
  const shelf = survivalNote.sections.find((section) => section.heading === "Keep Survival on the Knowledge shelf");

  assert.match(fact.body, /does not negotiate/i);
  assert.match(negotiable.body, /choose/i);
  assert.match(path.body, /evolution/i);
  assert.match(shelf.body, /not a Bible node/i);
  assert.match(shelf.body, /Third-eye/i);
});
