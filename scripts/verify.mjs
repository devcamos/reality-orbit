import { readFile } from "node:fs/promises";

const requiredLabels = [
  "Reality",
  "Domain",
  "Knowledge",
  "Category",
  "Scale",
  "Time",
  "Resources",
  "Processes",
  "Relationships",
  "Perspective",
];

const [document, fragment] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/reality-orbit.html", import.meta.url), "utf8"),
]);

const failures = [];

if (document.length === 0 || document.length > 2_000_000) {
  failures.push("index.html must be present and remain below 2 MB.");
}

if (!document.includes("Content-Security-Policy")) {
  failures.push("index.html must include its sandbox content-security policy.");
}

if (!fragment.includes('id="reality-orbit-prototype"')) {
  failures.push("The source fragment must keep its unique root ID.");
}

if (!fragment.includes("setSelectedNode")) {
  failures.push("The source fragment must keep the selected-node state transition.");
}

if (!fragment.includes("expandSelectedNode")) {
  failures.push("The source fragment must keep one-level orbit expansion.");
}

if (!fragment.includes("Canonical Ontology Expansion Contract")) {
  failures.push("The source fragment must keep the strict expansion brief.");
}

if (!fragment.includes("data-orbit-back")) {
  failures.push("The source fragment must keep reversible Back navigation.");
}

if (!fragment.includes('canonicalPath: ["Reality", "Category", "Knowledge"]')) {
  failures.push("Knowledge must remain a shortcut into the Category dimension.");
}

if (!fragment.includes('canonicalPath: ["Reality", "Category", "Resource"]')) {
  failures.push("Resources must remain a shortcut into the Category dimension.");
}

for (const label of requiredLabels) {
  if (!fragment.includes(label)) {
    failures.push(`Missing required orbit label: ${label}.`);
  }
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
