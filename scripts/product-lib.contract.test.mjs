import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertPresent } from "./lib/assert-present.mjs";

const librarySource = readFileSync(new URL("../src/lib/library.ts", import.meta.url), "utf8");
const fieldNotesSource = readFileSync(new URL("../src/lib/field-notes.ts", import.meta.url), "utf8");
const probabilityNote = JSON.parse(
  readFileSync(new URL("../src/lib/field-notes/probability-is-a-language-for-uncertainty.json", import.meta.url), "utf8"),
);
const survivalNote = JSON.parse(
  readFileSync(new URL("../src/lib/field-notes/given-chosen-and-the-path-here.json", import.meta.url), "utf8"),
);

test("Library sources map to existing teaching concepts", () => {
  assertPresent(librarySource, "library.ts");
  assert.match(librarySource, /id: "journey-to-the-west"/);
  assert.match(librarySource, /primaryNodeId: "potential-emergence"/);
  assert.match(librarySource, /primaryNodeId: "ooda-loop"/);
  assert.match(librarySource, /primaryNodeId: "attachment-theory"/);
  assert.match(librarySource, /export const librarySources/);
});

test("Field Notes keep teaching entries on existing primary nodes", () => {
  assertPresent(fieldNotesSource, "field-notes.ts");
  assert.match(fieldNotesSource, /"how-potential-becomes-consciousness"/);
  assert.match(fieldNotesSource, /"given-chosen-and-the-path-here"/);
  assert.match(fieldNotesSource, /"probability-is-a-language-for-uncertainty"/);
  assert.match(fieldNotesSource, /export const teachingNoteSlugs/);

  assert.equal(probabilityNote.primaryNodeId, "model");
  assert.equal(probabilityNote.subcategory, "Model");
  assert.equal(probabilityNote.featured, true);

  assert.equal(survivalNote.primaryNodeId, "survival");
  assert.equal(survivalNote.featured, true);
});
