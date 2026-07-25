import { readFile, writeFile } from "node:fs/promises";

const documentUrl = new URL("../index.html", import.meta.url);
const defaultFrameWidth = "max-width:736px";
const desktopFrameWidth = "max-width:1440px";
const defaultFrameTheme = ":root{color-scheme:light dark;background:light-dark(rgb(255 255 255), rgb(24 24 24))}";
const orbitFrameTheme = ":root{color-scheme:dark;background:Canvas}";
const document = await readFile(documentUrl, "utf8");

if (document.includes(desktopFrameWidth) && document.includes(orbitFrameTheme)) {
  console.log("Standalone desktop frame is already configured.");
  process.exit(0);
}

if (!document.includes(defaultFrameWidth) && !document.includes(desktopFrameWidth)) {
  throw new Error("Could not find the expected standalone frame width.");
}

const configuredDocument = document
  .replace(defaultFrameWidth, desktopFrameWidth)
  .replace(defaultFrameTheme, orbitFrameTheme);

await writeFile(documentUrl, configuredDocument);
console.log("Configured the standalone dark desktop frame.");
