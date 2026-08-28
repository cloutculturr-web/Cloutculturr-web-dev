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

import app, { dbReady } from "../backend/dist/server.js";

export default async function handler(req, res) {
  await dbReady;
  return app(req, res);
}
