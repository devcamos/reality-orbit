import assert from "node:assert/strict";
import test from "node:test";
import { librarySources } from "../src/lib/library.ts";
import { fieldNotes, teachingNoteSlugs } from "../src/lib/field-notes.ts";

test("Library sources map to existing teaching concepts", () => {
  assert.equal(librarySources.length, 3);
  for (const source of librarySources) {
    assert.ok(source.id);
    assert.ok(source.title);
    assert.ok(source.primaryNodeId);
    assert.match(source.summary, /\S/);
    assert.match(source.role, /\S/);
  }
  assert.ok(librarySources.some((source) => source.primaryNodeId === "potential-emergence"));
});

test("Field Notes keep teaching entries on existing primary nodes", () => {
  assert.ok(fieldNotes.length >= 7);
  assert.deepEqual([...teachingNoteSlugs], [
    "how-potential-becomes-consciousness",
    "given-chosen-and-the-path-here",
    "probability-is-a-language-for-uncertainty",
  ]);

  for (const slug of teachingNoteSlugs) {
    const note = fieldNotes.find((entry) => entry.slug === slug);
    assert.ok(note, `Missing teaching note ${slug}`);
    assert.equal(note.featured, true);
    assert.ok(note.primaryNodeId);
  }

  const probability = fieldNotes.find((note) => note.slug === "probability-is-a-language-for-uncertainty");
  assert.equal(probability?.primaryNodeId, "model");
  assert.equal(probability?.subcategory, "Model");
});
