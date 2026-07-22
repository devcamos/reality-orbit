import { readFile, writeFile } from "node:fs/promises";

const documentUrl = new URL("../index.html", import.meta.url);
const defaultFrameWidth = "max-width:736px";
const desktopFrameWidth = "max-width:1440px";
const document = await readFile(documentUrl, "utf8");

if (document.includes(desktopFrameWidth)) {
  console.log("Standalone desktop frame is already configured.");
  process.exit(0);
}

if (!document.includes(defaultFrameWidth)) {
  throw new Error("Could not find the expected standalone frame width.");
}

await writeFile(documentUrl, document.replace(defaultFrameWidth, desktopFrameWidth));
console.log("Configured the standalone desktop frame.");
