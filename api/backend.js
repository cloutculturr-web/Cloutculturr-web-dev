// Vercel Node.js Serverless Function wrapping the real Express backend
// (compiled by `backend`'s own `npm run build` — tsc + tsc-alias — into
// backend/dist/server.js, a plain-relative-import build with zero path-
// alias resolution left for Vercel's bundler to worry about).
//
// Express apps are themselves already a valid `(req, res) => {}` handler,
// so no protocol adaptation is needed here (unlike the frontend's SSR
// function, which wraps a Web-standard `fetch(request)` handler instead).
// The only thing this wrapper adds is awaiting `dbReady` first, so a cold
// start can't race ahead of the MongoDB connection and hit the DB before
// it's ready — warm invocations reuse the already-resolved promise.
//
// The import of backend/dist/server.js is done dynamically, inside the
// handler, and wrapped in try/catch — a *static* top-level import that
// throws during module evaluation (e.g. a dependency failing to load)
// would otherwise crash this whole function before handler() ever runs,
// with no way for us to surface what actually went wrong.

let cachedModule;

export default async function handler(req, res) {
  try {
    if (!cachedModule) {
      cachedModule = await import("../backend/dist/server.js");
    }
    await cachedModule.dbReady;
    return cachedModule.default(req, res);
  } catch (error) {
    console.error("api/backend.js failed to load or run the Express app:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        message: "Backend function failed to start",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    );
  }
}
