import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { isAbsolute, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const host = process.env.REALITY_ORBIT_HOST ?? "127.0.0.1";
const port = Number(process.env.REALITY_ORBIT_PORT ?? 4175);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
};

createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method ?? "")) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  const requestPath = new URL(request.url ?? "/", `http://${host}:${port}`).pathname;
  const relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const filePath = resolve(root, relativePath);
  const relativeFilePath = relative(root, filePath);

  if (relativeFilePath.startsWith("..") || isAbsolute(relativeFilePath)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const file = await stat(filePath);
    if (!file.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Length": file.size,
      "Content-Type": types[extname(filePath)] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch (_error) {
    response.writeHead(404).end("Not found");
  }
}).listen(port, host, () => {
  console.log(`Reality Orbit preview: http://${host}:${port}`);
});
