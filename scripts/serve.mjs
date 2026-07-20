import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const host = "127.0.0.1";
const port = 4175;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

createServer(async (request, response) => {
  const requestPath = new URL(request.url ?? "/", `http://${host}:${port}`).pathname;
  const relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const filePath = normalize(join(root, relativePath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const file = await stat(filePath);
    if (!file.isFile()) throw new Error("Not a file");
    response.writeHead(200, { "Content-Type": types[extname(filePath)] ?? "application/octet-stream" });
    createReadStream(filePath).pipe(response);
  } catch (_error) {
    response.writeHead(404).end("Not found");
  }
}).listen(port, host, () => {
  console.log(`Reality Orbit preview: http://${host}:${port}`);
});
