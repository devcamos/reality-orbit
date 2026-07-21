import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const fragment = await readFile(new URL("../src/reality-orbit.html", import.meta.url), "utf8");

const extractDeclaration = (startMarker, endMarker) => {
  const start = fragment.indexOf(startMarker);
  const end = fragment.indexOf(endMarker, start);
  assert.notEqual(start, -1, `Missing source declaration: ${startMarker}`);
  assert.notEqual(end, -1, `Missing source boundary: ${endMarker}`);
  return fragment.slice(start, end).trim();
};

const ontologyMatch = fragment.match(/const ontology = (\{[\s\S]*?\n    \});\n\n    const canonicalDimensions/);
assert.ok(ontologyMatch, "The canonical ontology must remain readable by the contract tests.");

const policySource = extractDeclaration("const canExploreNode", "\n\n    const validateOntology");
const roleSource = extractDeclaration("const roleForNode", "\n\n    const relationshipForNode");
const questionsSource = extractDeclaration("const dimensionQuestions", "\n\n    const buildConceptAnatomy");
const anatomySource = extractDeclaration("const buildConceptAnatomy", "\n\n    const understandFlowForNode");

const contract = runInNewContext(`
  const ontology = ${ontologyMatch[1]};
  ${policySource};
  ${roleSource};
  ${questionsSource};
  ${anatomySource};
  ({ ontology, canExploreNode, roleForNode, buildConceptAnatomy });
`, Object.create(null));

const nodes = Object.values(contract.ontology);
const terminalOntologyLevel = 4;
const ontologyLevel = (node) => node.canonicalPath.length - 1;

const reachableFromReality = () => {
  const reachable = new Set();
  const visit = (id) => {
    if (reachable.has(id)) return;
    const node = contract.ontology[id];
    assert.ok(node, `Missing referenced ontology node: ${id}`);
    reachable.add(id);
    for (const childId of node.children ?? []) visit(childId);
  };
  visit("reality");
  return reachable;
};

test("Reality is the only selection without Explore selected", () => {
  const withoutExplore = nodes.filter((node) => !contract.canExploreNode(node)).map((node) => node.id);
  assert.deepEqual(withoutExplore, ["reality"]);
  assert.equal(contract.canExploreNode(contract.ontology.reality), false);
});

test("every reachable non-root selection exposes Explore selected", () => {
  const reachable = reachableFromReality();
  for (const id of reachable) {
    if (id === "reality") continue;
    assert.equal(contract.canExploreNode(contract.ontology[id]), true, `${id} must expose Explore selected`);
  }
});

test("level-4 terminal selections remain explorable as final focused destinations", () => {
  const terminalNodes = nodes.filter((node) => ontologyLevel(node) === terminalOntologyLevel && (node.children?.length ?? 0) === 0);
  assert.ok(terminalNodes.length > 0, "The ontology must contain level-4 terminal concepts for this contract to prove.");
  for (const node of terminalNodes) {
    assert.equal(contract.canExploreNode(node), true, `${node.label} must remain explorable at the terminal level`);
  }
});

test("Amdahl's Law is the reference level-4 instance", () => {
  const amdahlsLaw = contract.ontology["amdahls-law"];
  assert.ok(amdahlsLaw, "Amdahl's Law must remain present in the ontology.");
  assert.equal(ontologyLevel(amdahlsLaw), terminalOntologyLevel);
  assert.deepEqual(
    Array.from(amdahlsLaw.canonicalPath),
    ["Reality", "Category", "Knowledge", "Law", "Amdahl's Law"],
  );
});

test("every ontology branch terminates at level 4", (context) => {
  const terminalNodes = nodes.filter((node) => (node.children?.length ?? 0) === 0);
  const shallowTerminals = terminalNodes.filter((node) => ontologyLevel(node) < terminalOntologyLevel);
  const overdeepTerminals = terminalNodes.filter((node) => ontologyLevel(node) > terminalOntologyLevel);
  const levelFourContainers = nodes.filter((node) => ontologyLevel(node) === terminalOntologyLevel && (node.children?.length ?? 0) > 0);

  if (shallowTerminals.length > 0) {
    const countsByDimension = Object.create(null);
    for (const node of shallowTerminals) {
      const dimension = node.canonicalPath[1];
      countsByDimension[dimension] = (countsByDimension[dimension] ?? 0) + 1;
    }
    const summary = Object.entries(countsByDimension).map(([dimension, count]) => `${dimension}: ${count}`).join(", ");
    const paths = shallowTerminals.map((node) => `L${ontologyLevel(node)} ${node.canonicalPath.join(" > ")}`).join("\n");
    context.diagnostic(`${shallowTerminals.length} branches stop before level 4 (${summary}).`);
    context.diagnostic(paths);
  }

  assert.equal(shallowTerminals.length, 0, "Every branch must be expanded through a level-4 terminal concept.");
  assert.equal(overdeepTerminals.length, 0, "No branch may terminate below level 4.");
  assert.equal(levelFourContainers.length, 0, "Level 4 is the terminal boundary and must not contain child nodes.");
});

test("every ontology node is reachable and has complete selection data", (context) => {
  const reachable = reachableFromReality();
  assert.equal(reachable.size, nodes.length, "Every ontology record must be reachable from Reality.");

  for (const [id, node] of Object.entries(contract.ontology)) {
    assert.equal(node.id, id, `${id} must keep a stable matching ID`);
    assert.ok(node.label?.trim(), `${id} must have a label`);
    assert.ok(node.summary?.trim(), `${node.label} must have a definition`);
    assert.ok(Array.isArray(node.canonicalPath) && node.canonicalPath.length > 0, `${node.label} must have a canonical path`);
    assert.ok(ontologyLevel(node) <= terminalOntologyLevel, `${node.label} must remain within the level-4 boundary`);
    assert.notEqual(contract.roleForNode(node), "Ontology node", `${node.label} must have a learner-facing role`);

    const anatomy = contract.buildConceptAnatomy(node);
    assert.ok(Object.keys(anatomy).length >= 7, `${node.label} must have at least seven Concept Anatomy fields`);
    for (const [label, value] of Object.entries(anatomy)) {
      assert.ok(label.trim(), `${node.label} contains an unnamed Concept Anatomy field`);
      assert.ok(String(value).trim(), `${node.label} has no content for ${label}`);
    }
  }

  context.diagnostic(`${nodes.length} ontology nodes passed the complete selection-data contract.`);
});

test("every child relationship resolves to the next canonical path level", () => {
  for (const node of nodes) {
    const children = node.children ?? [];
    assert.equal(new Set(children).size, children.length, `${node.label} must not repeat a child`);
    for (const childId of children) {
      const child = contract.ontology[childId];
      assert.ok(child, `${node.label} references missing child ${childId}`);
      assert.deepEqual(
        Array.from(child.canonicalPath),
        [...Array.from(node.canonicalPath), child.label],
        `${child.label} must extend ${node.label}'s canonical path by one level`,
      );
    }
  }
});

test("the selection renderer maps the policy to the visible actions", () => {
  assert.match(fragment, /understandButton\.hidden = false/);
  assert.match(fragment, /exploreButton\.hidden = !canExplore/);
  assert.match(fragment, /exploreButton\.disabled = canExplore && isCurrent/);
  assert.match(fragment, /exploreButton\.textContent = isCurrent \? "Exploring" : "Explore selected"/);
  assert.match(fragment, /exploreButton\.setAttribute\("aria-pressed", String\(canExplore && isCurrent\)\)/);
});
