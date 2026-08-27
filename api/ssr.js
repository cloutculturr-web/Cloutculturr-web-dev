// Vercel Node.js Serverless Function that wraps the TanStack Start SSR
// server built by `vite build` (dist/server/server.js). That build exports
// a Web-standard `{ fetch(request, env, ctx) }` handler — the same shape
// used by Cloudflare Workers — and depends on `node:async_hooks`, which is
// only available in Vercel's Node.js runtime, not the Edge runtime. This
// project's version of @tanstack/react-start ships no built-in Vercel/
// serverless adapter, so this file is the glue between the two.
//
// Handles both calling conventions Vercel's Node runtime may use: a modern
// single Web-standard Request, or the legacy (req, res) Node http pair.

export default async function handler(reqOrRequest, res) {
  const mod = await import("../dist/server/server.js");
  const fetchHandler = mod.default.fetch;

  // Modern Vercel Node runtime: invoked with a single Web-standard Request.
  if (typeof Request !== "undefined" && reqOrRequest instanceof Request) {
    return fetchHandler(reqOrRequest, {}, {});
  }

  // Legacy Vercel Node runtime: invoked with (req, res) Node http objects.
  const req = reqOrRequest;
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (value != null) {
      headers.append(key, String(value));
    }
  }

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? req : undefined,
    duplex: hasBody ? "half" : undefined,
  });

  const response = await fetchHandler(webRequest, {}, {});

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}
