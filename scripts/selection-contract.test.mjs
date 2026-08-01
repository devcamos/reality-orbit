import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const fragment = await readFile(new URL("../src/reality-orbit.html", import.meta.url), "utf8");
const runbook = await readFile(new URL("../RUNBOOK.md", import.meta.url), "utf8");
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
const relationshipSource = extractDeclaration("const relationshipForNode", "\n\n    const buildChatContext");
const chatContextSource = extractDeclaration("const buildChatContext", "\n\n    const renderPath");
const questionsSource = extractDeclaration("const dimensionQuestions", "\n\n    const buildConceptAnatomy");
const anatomySource = extractDeclaration("const buildConceptAnatomy", "\n\n    const createAnatomyField");
const visualSource = extractDeclaration("const visualModelForNode", "\n\n    const parentForNode");

const contract = runInNewContext(`
  const ontology = ${ontologyMatch[1]};
  const defaultOntologyLevel = 4;
  const terminalOntologyLevel = 5;
  const curatedLevelFivePolicy = "curated-level-five";
  const ontologyLevel = (node) => node.canonicalPath.length - 1;
  ${policySource};
  ${roleSource};
  ${relationshipSource};
  ${chatContextSource};
  ${questionsSource};
  ${anatomySource};
  ${visualSource};
  ({ ontology, canExploreNode, canPlayVisualForNode, roleForNode, buildChatContext, buildConceptAnatomy, visualModelForNode });
`, Object.create(null));

const nodes = Object.values(contract.ontology);
const defaultOntologyLevel = 4;
const terminalOntologyLevel = 5;
const curatedLevelFivePolicy = "curated-level-five";
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

test("expansion guidance preserves curated breadth and permits only explicit terminal level-5 exceptions", () => {
  const heading = "## Canonical Ontology Expansion Contract";
  const start = runbook.indexOf(heading);
  const end = runbook.indexOf("\n## ", start + heading.length);
  assert.notEqual(start, -1, "The runbook must contain the canonical expansion contract.");
  assert.notEqual(end, -1, "The canonical expansion contract must end before the next runbook section.");

  const expansionContract = runbook.slice(start, end);
  assert.match(expansionContract, /there is no target count/i, "Expansion guidance must not impose a child-count quota.");
  assert.doesNotMatch(expansionContract, /5[–-]10 children/i, "Expansion guidance must not restore the former 5–10-child quota.");
  assert.match(expansionContract, /level 4 is the default maximum, not a target/i, "Expansion guidance must not force every branch to level 4.");
  assert.match(expansionContract, /Level 5 is allowed only when that exact level-4 parent has received an explicit/i, "Expansion guidance must require explicit approval for level 5.");
  assert.match(expansionContract, /Never expand a level-5 node/i, "Expansion guidance must keep level 5 terminal.");
  assert.match(expansionContract, /data\/v1-curation\.json/, "Expansion guidance must retain the editorial publication gate.");
});

test("Reality is the only selection without a contextual Explore action", () => {
  const withoutExplore = nodes.filter((node) => !contract.canExploreNode(node)).map((node) => node.id);
  assert.deepEqual(withoutExplore, ["reality"]);
  assert.equal(contract.canExploreNode(contract.ontology.reality), false);
});

test("each canonical dimension teaches distinct contextual guidance", () => {
  const dimensionIds = ["domain", "category", "time", "scale", "perspective"];
  const contextFields = ["Scope", "How to use it", "Common confusion"];

  for (const field of contextFields) {
    const values = dimensionIds.map((id) => contract.buildConceptAnatomy(contract.ontology[id])[field]);
    assert.ok(values.every((value) => value?.trim()), `Every dimension must explain ${field}.`);
    assert.equal(new Set(values).size, dimensionIds.length, `${field} must be specific to each dimension.`);
  }

  const combinedGuidance = dimensionIds
    .flatMap((id) => Object.values(contract.buildConceptAnatomy(contract.ontology[id])))
    .join(" ");
  assert.doesNotMatch(combinedGuidance, /can be applied across every subject represented/i);
  assert.doesNotMatch(combinedGuidance, /Choose a value within/i);
  assert.doesNotMatch(combinedGuidance, /does not own or completely define/i);
});

test("every reachable non-root selection exposes a contextual Explore action", () => {
  const reachable = reachableFromReality();
  for (const id of reachable) {
    if (id === "reality") continue;
    assert.equal(contract.canExploreNode(contract.ontology[id]), true, `${id} must expose a contextual Explore action`);
  }
});

test("only Laws and Principles expose the V1 visual representation", () => {
  const visualNodes = nodes.filter((node) => contract.canPlayVisualForNode(node));
  assert.ok(visualNodes.length > 0, "The V1 visual scope must contain Laws and Principles.");

  for (const node of nodes) {
    const belongsToVisualFamily = node.canonicalPath.includes("Knowledge") && ["Law", "Principle"].includes(node.canonicalPath[3]);
    assert.equal(contract.canPlayVisualForNode(node), belongsToVisualFamily, `${node.label} must follow the visual representation scope.`);
  }
});

test("every visualised Law or Principle has a complete visual representation model", () => {
  for (const node of nodes.filter((candidate) => contract.canPlayVisualForNode(candidate))) {
    const visual = contract.visualModelForNode(node);
    assert.ok(["context", "mechanism", "focus"].includes(visual.mode), `${node.label} must select a visual mode.`);
    assert.ok(visual.caption?.trim(), `${node.label} must have a visual caption.`);
    assert.equal(visual.steps.length, 3, `${node.label} must have Foundation, Mechanism, and Meaning visual steps.`);
    for (const step of visual.steps) {
      assert.ok(step.label?.trim(), `${node.label} visual step needs a label.`);
      assert.ok(step.value?.trim(), `${node.label} visual step needs teaching content.`);
    }
  }
});

test("authored visual demonstrations govern the popup captions", () => {
  for (const node of nodes.filter((candidate) => contract.canPlayVisualForNode(candidate))) {
    const anatomy = contract.buildConceptAnatomy(node);
    if (!anatomy["Visual demonstration"]) continue;
    assert.equal(contract.visualModelForNode(node).caption, anatomy["Visual demonstration"], `${node.label} must keep its authored visual teaching intent.`);
  }
});

test("level-4 terminal selections remain explorable as final focused destinations", () => {
  const terminalNodes = nodes.filter((node) => ontologyLevel(node) === defaultOntologyLevel && (node.children?.length ?? 0) === 0);
  assert.ok(terminalNodes.length > 0, "The ontology must contain level-4 terminal concepts for this contract to prove.");
  for (const node of terminalNodes) {
    assert.equal(contract.canExploreNode(node), true, `${node.label} must remain explorable at the terminal level`);
  }
});

test("Amdahl's Law is the reference level-4 instance", () => {
  const amdahlsLaw = contract.ontology["amdahls-law"];
  assert.ok(amdahlsLaw, "Amdahl's Law must remain present in the ontology.");
  assert.equal(ontologyLevel(amdahlsLaw), defaultOntologyLevel);
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

test("Character is a distinct Individual Differences concept rather than a Personality subtype", () => {
  const individualDifferences = contract.ontology["individual-differences"];
  assert.deepEqual(
    Array.from(individualDifferences.canonicalPath),
    ["Reality", "Domain", "Psychological", "Individual differences"],
  );
  assert.deepEqual(
    Array.from(individualDifferences.children),
    ["personality", "temperament", "character", "personal-values", "abilities"],
  );

  for (const id of individualDifferences.children) {
    const sibling = contract.ontology[id];
    assert.equal(ontologyLevel(sibling), defaultOntologyLevel, `${sibling.label} must remain a level-4 peer.`);
    assert.equal(sibling.relationshipToParent, "ASPECT_OF", `${sibling.label} must remain a peer aspect of Individual differences.`);
  }

  const character = contract.ontology.character;
  assert.deepEqual(
    Array.from(character.canonicalPath),
    ["Reality", "Domain", "Psychological", "Individual differences", "Character"],
  );
  assert.equal(contract.ontology.personality.children?.includes("character") ?? false, false);
  assert.equal(character.expansionPolicy, curatedLevelFivePolicy);
  assert.deepEqual(
    Array.from(character.children),
    ["practical-wisdom", "courage", "integrity", "compassion", "justice", "humility", "self-control", "responsibility"],
  );

  for (const id of ["personality", "temperament", "personal-values", "abilities"]) {
    assert.equal(contract.ontology[id].children?.length ?? 0, 0, `${contract.ontology[id].label} must remain terminal at level 4.`);
    assert.equal(contract.ontology[id].expansionPolicy, undefined, `${contract.ontology[id].label} must not inherit Character's exception.`);
  }

  for (const id of character.children) {
    const quality = contract.ontology[id];
    assert.equal(ontologyLevel(quality), terminalOntologyLevel, `${quality.label} must be a level-5 Character quality.`);
    assert.equal(quality.children?.length ?? 0, 0, `${quality.label} must remain terminal.`);
    assert.equal(contract.roleForNode(quality), "Character quality");
    assert.equal(contract.buildChatContext(quality).relationshipToParent, "QUALITY_OF");
  }

  const requiredCharacterFields = [
    "Statement",
    "First principles",
    "Components",
    "Mechanism",
    "Development",
    "Evidence",
    "Scope",
    "Limitations",
    "Applications",
    "Common confusion",
  ];
  const characterAnatomy = contract.buildConceptAnatomy(character);
  for (const field of requiredCharacterFields) {
    assert.ok(characterAnatomy[field]?.trim(), `Character must explain ${field}.`);
  }
  assert.match(characterAnatomy["Common confusion"], /not simply a subtype of Personality/i);
});

test("Psychological coverage exposes the approved level-4 teaching vocabularies", () => {
  const psychological = contract.ontology.psychological;
  assert.deepEqual(
    Array.from(psychological.children),
    ["cognition", "emotion", "motivation", "behaviour", "development", "evolutionary-psychology", "individual-differences"],
  );

  const expectedChildren = {
    emotion: ["joy", "sadness", "fear", "anger", "disgust", "surprise"],
    motivation: ["biological-regulation", "threat-avoidance", "incentive-motivation", "achievement-motivation", "affiliation-motivation", "autonomy-motivation", "meaning-motivation"],
    behaviour: ["reflexive-behaviour", "instinctive-behaviour", "conditioned-behaviour", "habitual-behaviour", "goal-directed-behaviour"],
    development: ["cognitive-development", "emotional-development", "social-development", "personality-development", "identity-development", "moral-development"],
  };

  for (const [id, childIds] of Object.entries(expectedChildren)) {
    const area = contract.ontology[id];
    assert.equal(ontologyLevel(area), 3, `${area.label} must remain at level 3.`);
    assert.deepEqual(Array.from(area.children), childIds, `${area.label} must expose only its approved teaching concepts.`);
    assert.equal(contract.buildChatContext(area).terminalConcept, false, `${area.label} must expose its curated continuation.`);
    assert.ok(Object.keys(contract.buildConceptAnatomy(area)).length >= 7, `${area.label} must remain independently teachable.`);
    for (const childId of childIds) {
      const child = contract.ontology[childId];
      assert.equal(ontologyLevel(child), defaultOntologyLevel, `${child.label} must be level 4.`);
      assert.equal(child.children?.length ?? 0, 0, `${child.label} must remain terminal.`);
      assert.equal(contract.roleForNode(child), "Domain concept");
    }
  }

  assert.match(
    contract.buildConceptAnatomy(psychological)["Common confusion"],
    /cross-cutting explanatory approach/i,
  );
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
    assert.equal(ontologyLevel(setting), defaultOntologyLevel, `${setting.label} must be level 4`);
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

test("every ontology branch respects the default level-4 boundary and explicit terminal level-5 policy", (context) => {
  const terminalNodes = nodes.filter((node) => (node.children?.length ?? 0) === 0);
  const overdeepNodes = nodes.filter((node) => ontologyLevel(node) > terminalOntologyLevel);
  const levelFourContainers = nodes.filter((node) => ontologyLevel(node) === defaultOntologyLevel && (node.children?.length ?? 0) > 0);
  const levelFiveNodes = nodes.filter((node) => ontologyLevel(node) === terminalOntologyLevel);
  const countsByLevel = Object.fromEntries(
    [0, 1, 2, 3, 4, 5].map((level) => [level, terminalNodes.filter((node) => ontologyLevel(node) === level).length]),
  );

  context.diagnostic(`Approved terminal concepts by level: ${JSON.stringify(countsByLevel)}.`);

  assert.equal(overdeepNodes.length, 0, "No ontology node may exceed terminal level 5.");
  assert.deepEqual(levelFourContainers.map((node) => node.id), ["character"], "Character must be the sole level-4 container.");
  assert.equal(levelFourContainers[0].expansionPolicy, curatedLevelFivePolicy);
  assert.ok(levelFiveNodes.length > 0, "The approved Character exception must expose level-5 concepts.");
  for (const node of levelFiveNodes) {
    assert.equal(node.children?.length ?? 0, 0, `${node.label} must be terminal at level 5.`);
    assert.equal(node.canonicalPath[4], "Character", `${node.label} must sit beneath the approved Character container.`);
  }
});

test("every ontology node is reachable and has complete selection data", (context) => {
  const reachable = reachableFromReality();
  assert.equal(reachable.size, nodes.length, "Every ontology record must be reachable from Reality.");

  for (const [id, node] of Object.entries(contract.ontology)) {
    assert.equal(node.id, id, `${id} must keep a stable matching ID`);
    assert.ok(node.label?.trim(), `${id} must have a label`);
    assert.ok(node.summary?.trim(), `${node.label} must have a definition`);
    assert.ok(Array.isArray(node.canonicalPath) && node.canonicalPath.length > 0, `${node.label} must have a canonical path`);
    assert.ok(ontologyLevel(node) <= terminalOntologyLevel, `${node.label} must remain within the selective level-5 boundary`);
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

test("every reachable node has the complete Pareto Concept Anatomy model", (context) => {
  const paretoFields = [
    "Definition",
    "Mechanism",
    "Applies when",
    "Breaks when",
    "Example",
    "Counterexample",
    "Decision rule",
  ];

  for (const node of nodes) {
    const anatomy = contract.buildConceptAnatomy(node);
    assert.equal(anatomy.Definition, node.summary, `${node.label} must use its canonical summary as Definition.`);
    for (const field of paretoFields) {
      assert.ok(String(anatomy[field] ?? "").trim(), `${node.label} must provide Pareto field ${field}.`);
    }
  }

  assert.doesNotMatch(fragment, /data-understand-lead-label/);
  assert.doesNotMatch(fragment, /data-understand-support-label/);
  context.diagnostic(`${nodes.length} ontology nodes passed the Pareto Concept Anatomy review.`);
});

test("every reachable node has a distinct contextual lens rather than generic fallback copy", (context) => {
  const requiredContextFields = [
    "Definition",
    "Mechanism",
    "Applies when",
    "Breaks when",
    "Example",
    "Counterexample",
    "Decision rule",
  ];
  const fingerprints = new Map();
  const genericFallbacks = [
    /A useful concept needs a clear definition/i,
    /A reusable lens that compresses detail/i,
    /Check that the situation matches the definition/i,
    /The concept is a representation used for reasoning/i,
    /Use this concept where the following description applies/i,
  ];

  for (const node of nodes) {
    const anatomy = contract.buildConceptAnatomy(node);
    const contextualValues = requiredContextFields.map((field) => {
      const value = String(anatomy[field] ?? "").trim();
      assert.ok(value, `${node.label} must provide node-specific ${field}.`);
      return value;
    });
    const combined = contextualValues.join(" ");
    assert.match(combined, new RegExp(node.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `${node.label}'s contextual lens must name its subject.`);
    for (const genericFallback of genericFallbacks) {
      assert.doesNotMatch(combined, genericFallback, `${node.label} must not expose generic fallback copy.`);
    }

    const fingerprint = contextualValues.join("\n");
    assert.equal(fingerprints.has(fingerprint), false, `${node.label} must not duplicate ${fingerprints.get(fingerprint)}'s contextual lens.`);
    fingerprints.set(fingerprint, node.label);
  }

  context.diagnostic(`${nodes.length} distinct node-specific contextual lenses passed review.`);
});

test("content audit keeps every teaching value unique and Feynman-sized enough to review", (context) => {
  const reachableNodes = nodes.filter((node) => reachableFromReality().has(node.id));
  const fields = ["summary", "Definition", "Mechanism", "Applies when", "Breaks when", "Example", "Counterexample", "Decision rule"];
  const duplicateGroups = {};
  const longValues = [];

  for (const field of fields) {
    const values = new Map();
    for (const node of reachableNodes) {
      const value = field === "summary"
        ? node.summary
        : contract.buildConceptAnatomy(node)[field];
      const normalized = String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
      if (!normalized) continue;
      const wordCount = normalized.split(/\s+/).length;
      if (wordCount > 40) {
        longValues.push({ label: node.label, field, wordCount, value: String(value).trim() });
      }
      const ids = values.get(normalized) ?? [];
      ids.push(node.id);
      values.set(normalized, ids);
    }
    duplicateGroups[field] = [...values.values()]
      .filter((ids) => ids.length > 1)
      .map((ids) => ids.map((id) => contract.ontology[id].label));
  }

  for (const [field, groups] of Object.entries(duplicateGroups)) {
    assert.deepEqual(groups, [], `${field} must not repeat exact teaching copy across reachable nodes.`);
  }

  assert.deepEqual(
    longValues.map(({ label, field, wordCount }) => ({ label, field, wordCount })),
    [],
    "Feynman teaching fields should stay at or below 40 words; split or simplify the authored copy when they exceed it.",
  );

  context.diagnostic(JSON.stringify({ reachable: reachableNodes.length, duplicateGroups, longValueCount: longValues.length }));
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

test("selection automatically renders Concept Anatomy and exposes contextual exploration controls", () => {
  assert.doesNotMatch(fragment, /data-understand-action/);
  assert.doesNotMatch(fragment, /function openUnderstand/);
  assert.match(fragment, /renderUnderstand\(node\);/);
  assert.match(fragment, /understandView\.scrollTo\(\{ top: 0, behavior: "auto" \}\);/);
  assert.match(fragment, /actionGroup\.hidden = !canExplore/);
  assert.match(fragment, /exploreButton\.hidden = !canExplore/);
  assert.match(fragment, /exploreButton\.disabled = canExplore && isCurrent/);
  assert.match(fragment, /exploreButton\.style\.setProperty\("--explore-color", exploreColor\)/);
  assert.match(fragment, /contextExploreButton\.style\.setProperty\("--explore-color", exploreColor\)/);
  assert.match(fragment, /exploreButton\.textContent = isCurrent \? `Exploring \$\{node\.label\}` : `Explore \$\{node\.label\}`/);
  assert.match(fragment, /exploreButton\.setAttribute\("aria-pressed", String\(canExplore && isCurrent\)\)/);
  assert.match(fragment, /data-context-explore-action/);
  assert.match(fragment, /const canExploreFromDetail = canExplore && !isCurrent;/);
  assert.match(fragment, /detailAction\.hidden = !canExploreFromDetail;/);
  assert.match(fragment, /contextExploreButton\.textContent = `Explore \$\{node\.label\}`;/);
});

test("a mobile destination selection reveals its summary before the Concept Anatomy", () => {
  assert.match(fragment, /const orbitDetail = root\.querySelector\("\.orbit-detail"\);/);
  assert.match(fragment, /const setSelectedNode = \(nodeId, \{ revealMobileContent = false \} = \{\}\) =>/);
  assert.match(fragment, /window\.matchMedia\("\(max-width: 480px\)"\)\.matches/);
  assert.match(fragment, /orbitDetail\.scrollIntoView\(\{ behavior: reduceMotion \? "auto" : "smooth", block: "start" \}\)/);
  assert.match(fragment, /setSelectedNode\(child\.id, \{ revealMobileContent: true \}\);/);
  assert.match(fragment, /setSelectedNode\(parent\.id, \{ revealMobileContent: true \}\);/);
});

test("mobile contextual exploration returns the learner to the refreshed map", () => {
  assert.match(fragment, /#reality-orbit-prototype \.orbit-toolbar \.orbit-actions \{\n      display: none !important;/);
  assert.match(fragment, /#reality-orbit-prototype \.orbit-detail-action:not\(\[hidden\]\) \{\n      display: flex;/);
  assert.match(fragment, /const revealOrbitMap = \(\) => \{/);
  assert.match(fragment, /window\.matchMedia\("\(max-width: 980px\)"\)\.matches/);
  assert.match(fragment, /orbitStage\.scrollIntoView\(\{ behavior: reduceMotion \? "auto" : "smooth", block: "start" \}\)/);
  assert.match(fragment, /function exploreSelectedNode\(nodeId = selectedId, \{ revealMap = false \} = \{\}\)/);
  assert.match(fragment, /contextExploreButton\.addEventListener\("click", \(\) => exploreSelectedNode\(selectedId, \{ revealMap: true \}\)\);/);
});

test("Concept Anatomy maps the simple Pareto model to the selected node", () => {
  assert.doesNotMatch(fragment, /data-understand-flow/);
  assert.doesNotMatch(fragment, /understandFlowForNode/);
  assert.match(fragment, /const entries = Object\.entries\(buildConceptAnatomy\(node\)\);/);
  assert.match(fragment, /const paretoLabels = \[/);
  for (const label of ["Definition", "Mechanism", "Applies when", "Breaks when", "Example", "Counterexample", "Decision rule"]) {
    assert.match(fragment, new RegExp(`"${label}"`));
  }
  assert.match(fragment, /const principleItemsFor = \(value\)/);
  assert.match(fragment, /if \(label === "First principles"\)/);
  assert.match(fragment, /principlesList\.className = "understand-principles"/);
  assert.match(fragment, /<details class="understand-more" data-understand-more hidden>/);
  assert.match(fragment, /understandMore\.open = false;/);
  assert.match(fragment, /data-understand-pareto-fields/);
  assert.match(fragment, /const anatomySections = \[/);
  for (const sectionTitle of ["Meaning", "Boundary", "Contrast", "Use"]) {
    assert.match(fragment, new RegExp(`title: "${sectionTitle}"`));
  }
  assert.match(fragment, /createAnatomySection/);
  assert.doesNotMatch(fragment, /understand-verse-ref/);
  assert.match(fragment, /understandParetoFields\.replaceChildren/);
  assert.match(fragment, /understandView\.dataset\.selectedNode = node\.id;/);
  assert.match(fragment, /const summaryTitleForNode = \(node, role\) =>/);
  assert.match(fragment, /understandEyebrow\.textContent = summaryTitleForNode\(node, role\);/);
  assert.match(fragment, /understandTitle\.textContent = node\.label;/);
});
