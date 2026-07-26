import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const requiredLabels = [
  "Reality",
  "Domain",
  "Category",
  "Time",
  "Scale",
  "Perspective",
  "Entity",
  "Relationship",
  "Process",
  "Resource",
  "Environment",
  "Knowledge",
  "Evolutionary psychology",
  "Individual differences",
  "Emotion",
  "Motivation",
  "Behaviour",
  "Development",
  "Personality",
  "Temperament",
  "Character",
  "Values",
  "Abilities",
  "First-principles thinking",
  "Compound effect",
  "Parkinson's Law",
  "Pareto principle",
  "Stoicism",
  "Attachment theory",
  "Relationship exchange model",
  "Opportunity cost",
  "Second-order thinking",
];

const [
  applicationDocument,
  document,
  fragment,
  observatoryBackground,
  applicationSource,
  introductionSource,
  applicationStyles,
] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../legacy-index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/reality-orbit.html", import.meta.url), "utf8"),
  readFile(new URL("../assets/observatory-deep-space.webp", import.meta.url)),
  readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/ObservatoryIntroduction.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/app.css", import.meta.url), "utf8"),
]);

const failures = [];
const ontologyMatch = fragment.match(/const ontology = (\{[\s\S]*?\n    \});\n\n    const canonicalDimensions/);
let ontology = null;

if (!ontologyMatch) {
  failures.push("The canonical ontology data object could not be read for content validation.");
} else {
  ontology = runInNewContext(`(${ontologyMatch[1]})`, Object.create(null));
}

if (
  !applicationDocument.includes('<div id="root"></div>')
  || !applicationDocument.includes('src="/src/main.tsx"')
) {
  failures.push("index.html must remain the Vite application entry for the typed React shell.");
}

if (document.length === 0 || document.length > 2_000_000) {
  failures.push("legacy-index.html must be present and remain below 2 MB.");
}

if (!document.includes("max-width:1440px")) {
  failures.push("The standalone app must preserve a desktop-width frame for the map and adjacent Concept Anatomy view.");
}

if (!document.includes("Content-Security-Policy")) {
  failures.push("legacy-index.html must include its sandbox content-security policy.");
}

if (
  document.includes("unsafe-eval")
  || !document.includes("script-src 'none'")
  || !document.includes("style-src 'none'")
) {
  failures.push("The compatibility frame must not permit eval and its outer document must not execute scripts or styles.");
}

if (!document.includes(":root{color-scheme:dark;background:Canvas}")) {
  failures.push("The standalone frame must keep Reality Orbit in its deliberate dark orbital theme.");
}

if (
  observatoryBackground.length > 250_000
  || observatoryBackground.subarray(0, 4).toString("ascii") !== "RIFF"
  || observatoryBackground.subarray(8, 12).toString("ascii") !== "WEBP"
) {
  failures.push("The observatory background must remain a compact WebP asset below 250 KB.");
}

if (!document.includes("img-src 'self' blob:") || !document.includes("img-src &#x27;self&#x27; blob:")) {
  failures.push("The standalone and embedded content policies must permit the project-local observatory asset.");
}

if (!fragment.includes('id="reality-orbit-prototype"')) {
  failures.push("The source fragment must keep its unique root ID.");
}

for (const orbitalVisualContract of [
  ":root {\n    color-scheme: dark !important;",
  "background: Canvas !important;",
  'url("/assets/observatory-deep-space.webp")',
  'data-visual-archetype="sun"',
  'data-visual-archetype="time"',
  "visualArchetypeForNode",
  "decorateOrbitButton",
  'button.dataset.dimension = node.canonicalPath[1] ?? "Reality"',
  'button.setAttribute("aria-label", `${node.label}. ${roleForNode(node)}. Select to update Concept Anatomy.`)',
  "transitionOrbit",
  'root.dataset.cameraState = "idle"',
  "@keyframes reality-breathe",
  "@keyframes observatory-drift",
  "@keyframes starfield-drift-far",
  "@keyframes starfield-drift-near",
  '<div class="orbit-starfield" aria-hidden="true"></div>',
  ".orbit-starfield::before",
  ".orbit-starfield::after",
  ".orbit-stage::before",
  ".orbit-stage::after",
  ".destination-marker::before",
  "--space-display:",
  'understandView.dataset.selectedRole = role.toLowerCase().replaceAll(" ", "-")',
  '.understand-view[data-selected-role="dimension"] .understand-context-card',
  "min-height: calc(100dvh - 0.625rem)",
]) {
  if (!fragment.includes(orbitalVisualContract)) {
    failures.push(`Missing deliberate orbital visual contract: ${orbitalVisualContract}.`);
  }
}

for (const firstContactContract of [
  [applicationSource, "reality-orbit-entered"],
  [applicationSource, "<ObservatoryIntroduction"],
  [introductionSource, "data-observatory-introduction"],
  [introductionSource, "data-enter-observatory"],
  [introductionSource, "Begin with Reality."],
  [applicationStyles, ".observatory-intro__enter:focus-visible"],
  [applicationStyles, "@media (prefers-reduced-motion: reduce)"],
]) {
  if (!firstContactContract[0].includes(firstContactContract[1])) {
    failures.push(`Missing observatory introduction contract: ${firstContactContract[1]}.`);
  }
}

if (fragment.includes("destination-meta") || fragment.includes('meta.textContent = "Dimension"')) {
  failures.push("The implied Dimension role must not be repeated beneath root destinations.");
}

for (const reflectiveHoverContract of [
  "data-orbit-preview",
  "data-orbit-preview-summary",
  "data-orbit-preview-question",
  "data-orbit-preview-depth",
  "data-orbit-hover-reticle",
  "thoughtForNode",
  "bindOrbitPreview",
  "showOrbitPreview",
  "positionOrbitPreview",
  'orbitPreview.style.setProperty("--preview-left"',
  'orbitPreview.style.setProperty("--preview-top"',
  'window.addEventListener("resize"',
  'roleForNode(node) === "Dimension" ? "Lens on reality"',
  "orbitPreviewDepth.textContent = pathAvailability",
  "showOrbitalCursor",
  'root.addEventListener("mousemove", showOrbitalCursor)',
  'if (event.pointerType !== "mouse") showOrbitalCursor(event)',
  'orbitHoverReticle.dataset.input = event.pointerType === "touch" ? "touch" : "mouse"',
  "cursor: none !important",
  "@keyframes hover-reticle-shell-drift",
  "@keyframes hover-reticle-orbit-drift",
  'button.setAttribute("aria-describedby", "orbit-preview")',
  "pointer-events: none",
  'understandEyebrow.textContent = role === "Dimension" ? "A lens on reality"',
  'selectedRole.hidden = context.role === "Dimension"',
]) {
  if (!fragment.includes(reflectiveHoverContract)) {
    failures.push(`Missing reflective node-hover contract: ${reflectiveHoverContract}.`);
  }
}

if (!fragment.includes("setSelectedNode")) {
  failures.push("The source fragment must keep the selected-node state transition.");
}

if (!fragment.includes('button.setAttribute("aria-current"')) {
  failures.push("The selected destination must expose its current state accessibly.");
}

if (!fragment.includes("exploreSelectedNode")) {
  failures.push("The source fragment must keep selected-node exploration.");
}

if (!fragment.includes("renderUnderstand(node)") || !fragment.includes("data-understand-view")) {
  failures.push("Every selection must automatically update the Concept Anatomy view.");
}

for (const principlesListContract of [
  "principleItemsFor",
  'label === "First principles"',
  'principlesList.className = "understand-principles"',
  'field.dataset.anatomyField = label.toLowerCase().replaceAll(" ", "-")',
]) {
  if (!fragment.includes(principlesListContract)) {
    failures.push(`First principles must render as a semantic bullet list: ${principlesListContract}.`);
  }
}

for (const visualRepresentationContract of [
  "data-open-concept-visual",
  "data-concept-visual-dialog",
  "visualModelForNode",
  "renderConceptVisual",
  "conceptVisualDialog.showModal",
  "data-replay-concept-visual",
]) {
  if (!fragment.includes(visualRepresentationContract)) {
    failures.push(`Missing playable visual representation contract: ${visualRepresentationContract}.`);
  }
}

if (!fragment.includes("requestAnimationFrame(playConceptVisual)")) {
  failures.push("Opening a concept visual must start its animation without requiring a second user action.");
}

for (const visualScopeContract of [
  "const canPlayVisualForNode",
  '["Law", "Principle"].includes(node.canonicalPath[3])',
  "openConceptVisualButton.hidden = !canPlayVisual",
  ".orbit-detail-visual[hidden]",
  "display: none !important",
]) {
  if (!fragment.includes(visualScopeContract)) {
    failures.push(`Missing Laws-and-Principles visual scope contract: ${visualScopeContract}.`);
  }
}

for (const splitWorkspaceContract of [
  '<section class="orbit-universe-panel" aria-label="Universe workspace">',
  '<aside class="understand-view" data-understand-view',
  "grid-template-columns: minmax(0, 1fr) clamp(23rem, 30vw, 34rem)",
  "#reality-orbit-prototype .understand-view {\n    position: static;",
  "max-height: none;",
  "overflow: visible;",
  "border-radius: 1rem;",
]) {
  if (!fragment.includes(splitWorkspaceContract)) {
    failures.push(`Missing separated Universe-and-Concept-Anatomy workspace contract: ${splitWorkspaceContract}.`);
  }
}

if (fragment.includes("Copy expansion brief") || fragment.includes("Canonical Ontology Expansion Contract")) {
  failures.push("The viewer must not expose the former expansion-brief workflow.");
}

if (!fragment.includes("data-orbit-back")) {
  failures.push("The source fragment must keep reversible Back navigation.");
}

if (!fragment.includes("buildChatContext") || !fragment.includes("data-orbit-actions")) {
  failures.push("The source fragment must keep structured internal chat context and visible concept actions.");
}

if (fragment.includes("data-node-guide") || fragment.includes("orbit-guide")) {
  failures.push("Selection explanations must not float over unrelated map destinations.");
}

if (fragment.includes("data-understand-action") || !fragment.includes("data-explore-action") || !fragment.includes("data-context-explore-action")) {
  failures.push("Concept Anatomy must update automatically and selected concepts must expose contextual exploration.");
}

if (!fragment.includes("buildConceptAnatomy") || !fragment.includes("renderUnderstand(node)")) {
  failures.push("Every selected concept must automatically render role-aware Concept Anatomy.");
}

if (!fragment.includes("understand-definition-label") || !fragment.includes(">Definition</span>")) {
  failures.push("Concept Anatomy must explicitly identify the selected concept's definition.");
}

for (const understandLayoutContract of [
  "data-understand-eyebrow",
  "data-understand-title",
  "data-understand-statement",
  "data-understand-lead",
  "data-understand-foundations",
  "data-understand-context",
  "data-understand-more",
]) {
  if (!fragment.includes(understandLayoutContract)) {
    failures.push(`Missing editorial Understand layout contract: ${understandLayoutContract}.`);
  }
}

if (fragment.includes("data-understand-flow") || fragment.includes("understandFlowForNode")) {
  failures.push("Concept Anatomy must not show generic role flows that are not authored for the selected node.");
}

for (const selectedContentContract of [
  "const entries = Object.entries(buildConceptAnatomy(node))",
  "understandView.dataset.selectedNode = node.id",
  "understandTitle.textContent = node.label",
  "understandStatement.textContent = node.summary",
]) {
  if (!fragment.includes(selectedContentContract)) {
    failures.push(`Concept Anatomy must map selected-node content: ${selectedContentContract}.`);
  }
}

if (!fragment.includes('schemaVersion: "1.0"')) {
  failures.push("The chat context object must keep an explicit schema version.");
}

if (!fragment.includes("terminalConcept: !(node.children ?? []).length") || fragment.includes("terminalInstance:")) {
  failures.push("Grounded-chat context must identify childless terminal concepts at every approved ontology depth.");
}

if (!fragment.includes("relationshipToParent: relationshipForNode(node)")) {
  failures.push("The selected-node context must expose its typed relationship to its parent.");
}

for (const removedVisualConnection of ["orbit-connection", "data-orbit-connections", "data-connection-id"]) {
  if (fragment.includes(removedVisualConnection)) {
    failures.push(`The destination map must not render redundant centre-to-node spokes: ${removedVisualConnection}.`);
  }
}

for (const relationshipType of ["DIMENSION_OF", "SUBDOMAIN_OF", "TYPE_OF", "VALUE_OF", "LEVEL_OF", "LENS_OF", "CONCEPT_IN", "SUBTYPE_OF", "INSTANCE_OF", "ENVIRONMENT_TYPE_OF", "SETTING_OF", "QUALITY_OF"]) {
  if (!fragment.includes(`return "${relationshipType}"`)) {
    failures.push(`Missing canonical relationship type: ${relationshipType}.`);
  }
}

for (const internalGuideField of ["data-guide-path", "data-guide-parent", "data-guide-relationship", "data-guide-children"]) {
  if (fragment.includes(internalGuideField)) {
    failures.push(`Internal ontology metadata must not render in the learner panel: ${internalGuideField}.`);
  }
}

if (
  !fragment.includes("const defaultOntologyLevel = 4")
  || !fragment.includes("const terminalOntologyLevel = 5")
  || !fragment.includes('const curatedLevelFivePolicy = "curated-level-five"')
  || !fragment.includes("ontologyLevel(node) > terminalOntologyLevel")
  || !fragment.includes("Unapproved level-5 expansion")
  || !fragment.includes("Level-5 concept must be terminal")
) {
  failures.push("The renderer must enforce level 4 by default and allow only explicitly curated terminal level-5 exceptions.");
}

for (const explorationContract of [
  'const canExploreNode = (node) => node.id !== "reality"',
  "actionGroup.hidden = !canExplore",
  "exploreButton.hidden = !canExplore",
  "exploreButton.disabled = canExplore && isCurrent",
  'exploreButton.textContent = isCurrent ? "Exploring" : "Explore selected"',
]) {
  if (!fragment.includes(explorationContract)) {
    failures.push(`Missing root-aware exploration contract: ${explorationContract}.`);
  }
}

if (!fragment.includes("validateOntology") || !fragment.includes("Canonical path mismatch") || !fragment.includes("Duplicate child reference")) {
  failures.push("The renderer must reject invalid paths and duplicate or missing ontology relationships.");
}

if (!fragment.includes("Incomplete Concept Anatomy") || !fragment.includes("Unclassified concept role")) {
  failures.push("The renderer must reject missing learner content and unclassified concept roles.");
}

if (ontology) {
  const reachable = new Set();
  const visit = (id) => {
    if (reachable.has(id)) return;
    const node = ontology[id];
    if (!node) {
      failures.push(`Ontology references a missing child: ${id}.`);
      return;
    }
    reachable.add(id);
    for (const childId of node.children ?? []) visit(childId);
  };

  visit("reality");

  for (const [id, node] of Object.entries(ontology)) {
    if (node.id !== id) failures.push(`Ontology key and node ID differ: ${id}.`);
    if (!node.label?.trim()) failures.push(`Ontology node is missing a label: ${id}.`);
    if (!node.summary?.trim()) failures.push(`Ontology node is missing a definition: ${id}.`);
    if (!Array.isArray(node.canonicalPath) || node.canonicalPath.length === 0) failures.push(`Ontology node is missing a canonical path: ${id}.`);
    if (!reachable.has(id)) failures.push(`Ontology node is unreachable from Reality: ${id}.`);
  }
}

if (!fragment.includes("dimensionColors") || !fragment.includes("destinationLayouts") || !fragment.includes("data-node-kind")) {
  failures.push("The destination map must keep its semantic colour, stable-position, and node-shape contracts.");
}

for (const mobileContract of [
  "@media (max-width: 520px)",
  "@media (max-width: 480px)",
  ".orbit-path > span",
  "flex-basis: 100%",
  "min-height: 2.75rem",
  "data-selected-role",
  "height: clamp(430px, 118vw, 480px)",
]) {
  if (!fragment.includes(mobileContract)) {
    failures.push(`Missing mobile interaction contract: ${mobileContract}.`);
  }
}

const destinationLabelStyles = fragment.match(/\.destination-label\s*\{([\s\S]*?)\}/)?.[1] ?? "";
if (destinationLabelStyles.includes("text-overflow: ellipsis")) {
  failures.push("Mobile destination labels must not be truncated with ellipses.");
}

if (!fragment.includes('children: ["domain", "category", "time", "scale", "perspective"]')) {
  failures.push("Reality must connect directly to the five canonical dimensions only.");
}

if (!fragment.includes('canonicalPath: ["Reality", "Category", "Knowledge"]')) {
  failures.push("Knowledge must remain a child of the Category dimension.");
}

if (!fragment.includes('canonicalPath: ["Reality", "Category", "Resource"]')) {
  failures.push("Resource must remain a child of the Category dimension.");
}

const canonicalExpansions = [
  '["physical", "biological", "psychological", "social", "economic", "informational", "mathematical"]',
  '["law", "principle", "razor", "framework", "model", "theorem", "pattern", "theory", "method"]',
  '["resource-time", "energy", "capital", "information", "attention", "compute"]',
  '["process-change", "transformation", "exchange", "learning", "production"]',
  '["ownership", "dependency", "communication", "competition", "cooperation"]',
  '["perspective-individual", "perspective-scientific", "perspective-economic", "perspective-ethical", "perspective-cultural"]',
  '["amdahls-law", "brooks-law", "conways-law", "goodharts-law", "greshams-law", "littles-law", "metcalfes-law", "parkinsons-law"]',
];

for (const expansion of canonicalExpansions) {
  if (!fragment.includes(expansion)) {
    failures.push(`Missing verified canonical expansion: ${expansion}.`);
  }
}

for (const dimensionId of ["domain", "category", "time", "scale", "perspective"]) {
  const nodePattern = new RegExp(`${dimensionId}: \\{[\\s\\S]*?children: \\[`, "m");
  if (!nodePattern.test(fragment)) {
    failures.push(`Canonical dimension ${dimensionId} must expose a third-level child set.`);
  }
}

for (const label of requiredLabels) {
  if (!fragment.includes(label)) {
    failures.push(`Missing required orbit label: ${label}.`);
  }
}

for (const anatomyField of ["Statement", "First principles", "Variables", "Mental model", "Mechanism", "Predictions", "Assumptions", "Limitations", "Applications", "Visual demonstration", "Related laws"]) {
  if (!fragment.includes(`"${anatomyField}"`)) {
    failures.push(`Amdahl's Law is missing Concept Anatomy field: ${anatomyField}.`);
  }
}

for (const baselineAnatomyField of ["Purpose", "Governing question", "First principles", "Mental model", "Scope", "How to use it", "Common confusion"]) {
  if (!fragment.includes(`"${baselineAnatomyField}"`)) {
    failures.push(`Baseline Concept Anatomy is missing field: ${baselineAnatomyField}.`);
  }
}

if (!ontology?.ownership?.anatomy || Object.keys(ontology.ownership.anatomy).length < 7) {
  failures.push("Ownership must remain the authored reference Concept Anatomy for a terminal relationship type.");
}

for (const forbiddenLawInstance of ["galls-law", "murphys-law", "amdahl-serial-work", "amdahl-parallel-work", "amdahl-processor-count", "amdahl-speedup-ceiling", "amdahl-application"]) {
  if (fragment.includes(forbiddenLawInstance)) {
    failures.push(`Ontology must stop at the law instance boundary: ${forbiddenLawInstance}.`);
  }
}

for (const requiredKnowledgeType of ['id: "theory"', 'id: "method"']) {
  if (!fragment.includes(requiredKnowledgeType)) {
    failures.push(`Knowledge map must include the agreed first-class artifact type: ${requiredKnowledgeType}.`);
  }
}

if (fragment.includes('id: "heuristic"')) {
  failures.push("Heuristic must not be promoted to a first-class knowledge type without an explicit ontology decision.");
}

for (const forbiddenApi of ["fetch(", "XMLHttpRequest", "WebSocket("]) {
  if (fragment.includes(forbiddenApi)) {
    failures.push(`Unexpected network API in static visualization: ${forbiddenApi}.`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Reality Orbit production checks passed.");
}
