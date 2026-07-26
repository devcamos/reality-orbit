import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { setTimeout as wait } from "node:timers/promises";

const host = "127.0.0.1";
const port = 4185;
const baseUrl = `http://${host}:${port}`;

const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  cwd: new URL("..", import.meta.url),
  env: {
    ...process.env,
    REALITY_ORBIT_HOST: host,
    REALITY_ORBIT_PORT: String(port),
    REALITY_ORBIT_SERVE_ROOT: "dist",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk;
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk;
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Preview server exited before becoming ready.\n${serverOutput}`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch (_error) {
      // The server has not started listening yet.
    }
    await wait(100);
  }
  throw new Error(`Preview server did not become ready.\n${serverOutput}`);
};

await waitForServer();

test.after(() => {
  server.kill("SIGTERM");
});

test("preview server delivers the production document and observatory asset", async () => {
  const documentResponse = await fetch(baseUrl);
  assert.equal(documentResponse.status, 200);
  assert.match(documentResponse.headers.get("content-type") ?? "", /^text\/html/);
  assert.equal(documentResponse.headers.get("x-content-type-options"), "nosniff");
  assert.match(await documentResponse.text(), /Reality Orbit/);

  const assetResponse = await fetch(`${baseUrl}/assets/observatory-deep-space.webp`);
  assert.equal(assetResponse.status, 200);
  assert.equal(assetResponse.headers.get("content-type"), "image/webp");
  const asset = Buffer.from(await assetResponse.arrayBuffer());
  assert.equal(asset.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(asset.subarray(8, 12).toString("ascii"), "WEBP");
});

test("preview server supports HEAD and rejects unsupported requests", async () => {
  const headResponse = await fetch(baseUrl, { method: "HEAD" });
  assert.equal(headResponse.status, 200);
  assert.equal(await headResponse.text(), "");

  const postResponse = await fetch(baseUrl, { method: "POST" });
  assert.equal(postResponse.status, 405);
  assert.equal(postResponse.headers.get("allow"), "GET, HEAD");
});

test("preview server returns a clear 404 for unknown files", async () => {
  const response = await fetch(`${baseUrl}/not-a-real-reality-orbit-file`);
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Not found");
});
