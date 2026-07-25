import { readFile, writeFile } from "node:fs/promises";

const documentUrl = new URL("../index.html", import.meta.url);
const fragmentUrl = new URL("../src/reality-orbit.html", import.meta.url);
const defaultFrameWidth = "max-width:736px";
const desktopFrameWidth = "max-width:1440px";
const unboundedFrameWidth = "iframe{display:block;width:100%;height:";
const defaultFrameTheme = ":root{color-scheme:light dark;background:light-dark(rgb(255 255 255), rgb(24 24 24))}";
const orbitFrameTheme = ":root{color-scheme:dark;background:Canvas}";
const [document, fragment] = await Promise.all([
  readFile(documentUrl, "utf8"),
  readFile(fragmentUrl, "utf8"),
]);

if (!document.includes(defaultFrameWidth) && !document.includes(desktopFrameWidth) && !document.includes(unboundedFrameWidth)) {
  throw new Error("Could not find the expected standalone frame width.");
}

const escapeForSrcdoc = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#x27;");

const sourceStartMarker = "&lt;style&gt;\n  :root {\n    color-scheme: dark !important;";
const sourceEndMarker = "    renderOrbit();\n  })();\n&lt;/script&gt;";
const sourceStart = document.indexOf(sourceStartMarker);
const sourceEndStart = document.indexOf(sourceEndMarker, sourceStart);

if (sourceStart === -1 || sourceEndStart === -1) {
  throw new Error("Could not locate the embedded Reality Orbit source fragment.");
}

const sourceEnd = sourceEndStart + sourceEndMarker.length;
const syncedDocument = `${document.slice(0, sourceStart)}${escapeForSrcdoc(fragment)}${document.slice(sourceEnd)}`;
const configuredDocument = syncedDocument
  .replace(defaultFrameWidth, desktopFrameWidth)
  .replace(unboundedFrameWidth, `iframe{display:block;width:100%;${desktopFrameWidth};height:`)
  .replace(defaultFrameTheme, orbitFrameTheme)
  .replace("img-src blob:", "img-src 'self' blob:")
  .replace("img-src blob:", "img-src &#x27;self&#x27; blob:");

await writeFile(documentUrl, configuredDocument);
console.log("Synced Reality Orbit source into the standalone dark desktop frame.");
