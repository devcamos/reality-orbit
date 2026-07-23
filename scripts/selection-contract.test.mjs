import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const fragment = await readFile(new URL("../src/reality-orbit.html", import.meta.url), "utf8");
const v1Curation = JSON.parse(await readFile(new URL("../data/v1-curation.json", import.meta.url), "utf8"));

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
const anatomySource = extractDeclaration("const buildConceptAnatomy", "\n\n    const createAnatomyField");

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
// Baseline captured when the level-4 completion gate was introduced.
const initialShallowBranchCount = 53;
const ontologyLevel = (node) => node.canonicalPath.length - 1;

const terminalPathsFrom = (id, path = []) => {
  const node = contract.ontology[id];
  const nextPath = [...path, id];
  return (node.children?.length ?? 0) === 0
    ? [nextPath]
    : node.children.flatMap((childId) => terminalPathsFrom(childId, nextPath));
};

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

test("the requested study concepts are classified on intentional canonical paths", () => {
  const expectedPaths = {
    "evolutionary-psychology": ["Reality", "Domain", "Psychological", "Evolutionary psychology"],
    "first-principles-thinking": ["Reality", "Category", "Knowledge", "Method", "First-principles thinking"],
    "compound-effect": ["Reality", "Category", "Knowledge", "Principle", "Compound effect"],
    "parkinsons-law": ["Reality", "Category", "Knowledge", "Law", "Parkinson's Law"],
    "pareto-principle": ["Reality", "Category", "Knowledge", "Principle", "Pareto principle"],
    stoicism: ["Reality", "Perspective", "Ethical", "Stoicism"],
    "attachment-theory": ["Reality", "Category", "Knowledge", "Theory", "Attachment theory"],
    "relationship-exchange-model": ["Reality", "Category", "Knowledge", "Model", "Relationship exchange model"],
    "opportunity-cost": ["Reality", "Domain", "Economic", "Choice", "Opportunity cost"],
    "second-order-thinking": ["Reality", "Category", "Knowledge", "Method", "Second-order thinking"],
  };

  for (const [id, canonicalPath] of Object.entries(expectedPaths)) {
    const node = contract.ontology[id];
    assert.ok(node, `Missing requested study concept: ${id}`);
    assert.deepEqual(Array.from(node.canonicalPath), canonicalPath, `${node.label} must remain correctly classified.`);
  }

  assert.equal(contract.ontology["parkinsons-law"].kind, "law-instance", "Parkinson's Law must remain a named law.");
  assert.match(contract.ontology["relationship-exchange-model"].summary, /limited model/i);
});

test("requested study concepts provide complete, scoped teaching anatomy", () => {
  const conceptIds = [
    "evolutionary-psychology",
    "first-principles-thinking",
    "compound-effect",
    "parkinsons-law",
    "pareto-principle",
    "stoicism",
    "attachment-theory",
    "relationship-exchange-model",
    "opportunity-cost",
    "second-order-thinking",
  ];
  const requiredFields = ["Statement", "First principles", "Variables", "Mechanism", "Predictions", "Assumptions", "Limitations", "Applications", "Visual demonstration"];

  for (const id of conceptIds) {
    const anatomy = contract.buildConceptAnatomy(contract.ontology[id]);
    for (const field of requiredFields) {
      assert.ok(anatomy[field]?.trim(), `${contract.ontology[id].label} must explain ${field}.`);
    }
  }

  assert.match(contract.ontology["relationship-exchange-model"].anatomy.Limitations, /not a market law/i);
  assert.match(contract.ontology["pareto-principle"].anatomy.Limitations, /not a universal ratio/i);
});

test("every named law provides the complete law teaching anatomy", () => {
  const requiredFields = [
    "Statement",
    "First principles",
    "Variables",
    "Mechanism",
    "Predictions",
    "Assumptions",
    "Limitations",
    "Applications",
    "Visual demonstration",
    "Related laws",
  ];

  for (const law of nodes.filter((node) => node.kind === "law-instance")) {
    const anatomy = contract.buildConceptAnatomy(law);
    for (const field of requiredFields) {
      assert.ok(anatomy[field]?.trim(), `${law.label} must explain ${field}.`);
    }
  }
});

test("Environment is a complete category exemplar through level 4", () => {
  const environment = contract.ontology.environment;
  assert.equal(ontologyLevel(environment), 2);
  assert.deepEqual(
    Array.from(environment.children),
    ["natural-environment", "built-environment", "social-environment", "digital-environment", "institutional-environment"],
  );

  const environmentAnatomy = contract.buildConceptAnatomy(environment);
  for (const requiredField of ["Boundary", "Conditions and variables", "Mechanism", "Feedback", "Related concepts"]) {
    assert.ok(environmentAnatomy[requiredField], `Environment must explain ${requiredField}`);
  }

  for (const environmentTypeId of environment.children) {
    const environmentType = contract.ontology[environmentTypeId];
    assert.equal(ontologyLevel(environmentType), 3, `${environmentType.label} must be level 3`);
    assert.equal(contract.roleForNode(environmentType), "Environment type");
    assert.equal(environmentType.children.length, 1, `${environmentType.label} must lead to one terminal concept`);

    const setting = contract.ontology[environmentType.children[0]];
    assert.equal(ontologyLevel(setting), terminalOntologyLevel, `${setting.label} must be level 4`);
    assert.equal(contract.roleForNode(setting), "Environmental setting");
  }
});

test("a focused concept may expose one curated next concept", () => {
  const future = contract.ontology.future;
  assert.deepEqual(Array.from(future.children), ["expectation"]);
  const expectation = contract.ontology.expectation;
  assert.equal(expectation.children?.length, 1);
  assert.equal(contract.ontology[expectation.children[0]].children?.length ?? 0, 0);
});

test("V1 curation explicitly approves every published branch and terminal teaching path", () => {
  assert.equal(v1Curation.status, "editorially-curated");
  assert.ok(Array.isArray(v1Curation.admissionCriteria) && v1Curation.admissionCriteria.length >= 5);

  const levelTwoNodes = nodes.filter((node) => ontologyLevel(node) === 2);
  const reviews = new Map(v1Curation.branches.map((review) => [review.id, review]));
  assert.equal(reviews.size, v1Curation.branches.length, "A branch must have only one V1 review record.");
  assert.equal(reviews.size, levelTwoNodes.length, "Every published level-2 branch must have a V1 review record.");

  for (const branch of levelTwoNodes) {
    const review = reviews.get(branch.id);
    assert.ok(review, `${branch.label} must have a V1 curation decision.`);
    assert.ok(review.scope?.trim(), `${branch.label} must document its V1 scope.`);
    assert.ok(review.decision?.trim(), `${branch.label} must document why its published paths are included.`);

    const actualPaths = Array.from(terminalPathsFrom(branch.id), (path) => path.slice(1).join("> ")).sort();
    const approvedPaths = Array.from(review.approvedPaths, (path) => path.join("> ")).sort();
    assert.deepEqual(
      approvedPaths,
      actualPaths,
      `${branch.label} changed without an explicit V1 curation review.`,
    );
  }
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

  const resolvedBranchCount = initialShallowBranchCount - shallowTerminals.length;
  context.diagnostic(
    `Ontology completion: ${initialShallowBranchCount} → ${shallowTerminals.length} shallow endpoints (${resolvedBranchCount}/${initialShallowBranchCount} resolved).`,
  );

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

test("every visible child relationship is explicitly curated and advances the canonical path", () => {
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

test("selection automatically renders Concept Anatomy and exposes only exploration controls", () => {
  assert.doesNotMatch(fragment, /data-understand-action/);
  assert.doesNotMatch(fragment, /function openUnderstand/);
  assert.match(fragment, /renderUnderstand\(node\);/);
  assert.match(fragment, /understandView\.scrollTo\(\{ top: 0, behavior: "auto" \}\);/);
  assert.match(fragment, /actionGroup\.hidden = !canExplore/);
  assert.match(fragment, /exploreButton\.hidden = !canExplore/);
  assert.match(fragment, /exploreButton\.disabled = canExplore && isCurrent/);
  assert.match(fragment, /exploreButton\.textContent = isCurrent \? "Exploring" : "Explore selected"/);
  assert.match(fragment, /exploreButton\.setAttribute\("aria-pressed", String\(canExplore && isCurrent\)\)/);
});

test("a mobile destination selection reveals its summary before the Concept Anatomy", () => {
  assert.match(fragment, /const orbitDetail = root\.querySelector\("\.orbit-detail"\);/);
  assert.match(fragment, /const setSelectedNode = \(nodeId, \{ revealMobileContent = false \} = \{\}\) =>/);
  assert.match(fragment, /window\.matchMedia\("\(max-width: 480px\)"\)\.matches/);
  assert.match(fragment, /orbitDetail\.scrollIntoView\(\{ behavior: reduceMotion \? "auto" : "smooth", block: "start" \}\)/);
  assert.match(fragment, /setSelectedNode\(child\.id, \{ revealMobileContent: true \}\);/);
  assert.match(fragment, /setSelectedNode\(parent\.id, \{ revealMobileContent: true \}\);/);
});

test("Concept Anatomy maps every visible teaching field to the selected node", () => {
  assert.doesNotMatch(fragment, /data-understand-flow/);
  assert.doesNotMatch(fragment, /understandFlowForNode/);
  assert.match(fragment, /const entries = Object\.entries\(buildConceptAnatomy\(node\)\);/);
  assert.match(fragment, /\["Statement", "Governing question", "Problem", "Predictions", "Prediction", "First principles"\]/);
  assert.match(fragment, /data-understand-support-label/);
  assert.match(fragment, /understandSupportLabel\.textContent = support\[0\];/);
  assert.match(fragment, /understandView\.dataset\.selectedNode = node\.id;/);
  assert.match(fragment, /understandEyebrow\.textContent = `\$\{role\} · Concept anatomy`;/);
  assert.match(fragment, /understandTitle\.textContent = node\.label;/);
  assert.match(fragment, /understandStatement\.textContent = node\.summary;/);
});
