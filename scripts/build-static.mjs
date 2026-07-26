import { copyFile, cp, mkdir, rm } from "node:fs/promises";

const outputUrl = new URL("../public/", import.meta.url);
const assetSourceUrl = new URL("../assets/", import.meta.url);
const assetOutputUrl = new URL("assets/", outputUrl);

await import("./configure-standalone-frame.mjs");
await rm(outputUrl, { force: true, recursive: true });
await mkdir(outputUrl, { recursive: true });
await copyFile(new URL("../index.html", import.meta.url), new URL("index.html", outputUrl));
await cp(assetSourceUrl, assetOutputUrl, { recursive: true });

console.log("Built the Reality Orbit static deployment in public/.");
