/**
 * Dev server: static files + /api/v1/translate proxy → Ghana NLP (fixes browser CORS).
 * Key: set GHANA_NLP_SUBSCRIPTION_KEY in .env (see .env.example), or rely on the
 * browser sending Ocp-Apim-Subscription-Key (config.js SUBSCRIPTION_KEY).
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const UPSTREAM_TRANSLATE = "https://translation-api.ghananlp.org/v1/translate";
const SUBSCRIPTION_HEADER = "Ocp-Apim-Subscription-Key";

loadDotEnv(path.join(ROOT, ".env"));

function loadDotEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (process.env[k] === undefined) process.env[k] = v;
    }
  } catch {
    /* optional file */
  }
}

function serverSubscriptionKey() {
  const k = process.env.GHANA_NLP_SUBSCRIPTION_KEY;
  return typeof k === "string" && k.trim() ? k.trim() : "";
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  const abs = path.join(ROOT, clean);
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8"))
    );
    req.on("error", reject);
  });
}

async function handleTranslateProxy(req, res) {
  const body = await readRequestBody(req);

  const envKey = serverSubscriptionKey();
  const clientKey = req.headers["ocp-apim-subscription-key"];
  const key =
    envKey ||
    (typeof clientKey === "string" && clientKey.trim() ? clientKey.trim() : "");

  const headers = {
    "Content-Type": "application/json",
  };
  if (key) headers[SUBSCRIPTION_HEADER] = key;

  let upstream;
  try {
    upstream = await fetch(UPSTREAM_TRANSLATE, {
      method: "POST",
      headers,
      body: body || "{}",
    });
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        type: "ProxyError",
        message: err instanceof Error ? err.message : String(err),
      })
    );
    return;
  }

  const text = await upstream.text();
  const outType = upstream.headers.get("content-type") || "application/json";
  res.writeHead(upstream.status, { "Content-Type": outType });
  res.end(text);
}

function serveStatic(req, res, urlPath) {
  let filePath = safeResolve(urlPath === "/" ? "/index.html" : urlPath);
  if (!filePath) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    const configured = Boolean(serverSubscriptionKey());
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(
      JSON.stringify({
        ok: true,
        subscriptionConfigured: configured,
      })
    );
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/v1/translate") {
    try {
      await handleTranslateProxy(req, res);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          type: "ProxyError",
          message: err instanceof Error ? err.message : String(err),
        })
      );
    }
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res, url.pathname);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" }).end("Method Not Allowed");
});

server.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Threadline dev server → http://localhost:${PORT}/`);
  console.log(`  Proxy: POST /api/v1/translate → ${UPSTREAM_TRANSLATE}`);
  if (serverSubscriptionKey()) {
    console.log("  API key: loaded from GHANA_NLP_SUBSCRIPTION_KEY (.env)");
  } else {
    console.log(
      "  API key: set GHANA_NLP_SUBSCRIPTION_KEY in .env and/or SUBSCRIPTION_KEY in assets/js/config.js"
    );
  }
});
