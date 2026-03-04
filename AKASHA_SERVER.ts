import { parse as parseYaml } from "jsr:@std/yaml@^1.0.5";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";

const PORT = RUNTIME_POLICY.akasha.port;
const HOST = RUNTIME_POLICY.akasha.host;
const SYSTEM_HOST = RUNTIME_POLICY.system.host;
const SYSTEM_PORT = RUNTIME_POLICY.system.port;
const SYSTEM_API_BASE = `http://${SYSTEM_HOST}:${SYSTEM_PORT}`;
const CONTROL_TOKEN = RUNTIME_POLICY.system.controlToken;
const ROOT = "./";
const REST_JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
} as const;

RUNTIME_POLICY.logFingerprintOnce("akasha-server");

let clients = new Set<WebSocket>();

// Store the latest state of the universe
let akashaState: string = "{}";
let codexDigest: {
  species: unknown[];
  chronicles: unknown[];
  relics: unknown[];
} = { species: [], chronicles: [], relics: [] };

const buildForwardHeaders = (
  incoming: Headers,
  includeJsonContentType: boolean,
): Headers => {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (includeJsonContentType) headers.set("Content-Type", "application/json");
  if (CONTROL_TOKEN.length > 0) {
    headers.set("x-omega-control-token", CONTROL_TOKEN);
  }
  const incomingToken = (incoming.get("x-omega-control-token") ?? "").trim();
  if (incomingToken.length > 0) {
    headers.set("x-omega-control-token", incomingToken);
  }
  return headers;
};

const json = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), { status, headers: REST_JSON_HEADERS });

const proxyTelemetry = async (incoming: Request): Promise<Response> => {
  try {
    const response = await fetch(`${SYSTEM_API_BASE}/api/telemetry`, {
      method: "GET",
      headers: buildForwardHeaders(incoming.headers, false),
    });
    const raw = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        ok: false,
        reason: "INVALID_SYSTEM_TELEMETRY_RESPONSE",
        raw: raw.slice(0, 240),
      };
    }
    return json(parsed, response.status);
  } catch (err) {
    return json({
      ok: false,
      reason: "SYSTEM_TELEMETRY_UNREACHABLE",
      details: String(err),
      system: `${SYSTEM_HOST}:${SYSTEM_PORT}`,
    }, 503);
  }
};

const proxyInject = async (incoming: Request): Promise<Response> => {
  let bodyText = "";
  try {
    bodyText = await incoming.text();
  } catch {
    return json({ ok: false, reason: "INVALID_JSON_BODY" }, 400);
  }
  if (bodyText.trim().length === 0) {
    return json({ ok: false, reason: "EMPTY_REQUEST_BODY" }, 400);
  }

  try {
    const response = await fetch(`${SYSTEM_API_BASE}/api/inject`, {
      method: "POST",
      headers: buildForwardHeaders(incoming.headers, true),
      body: bodyText,
    });
    const raw = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        ok: false,
        reason: "INVALID_SYSTEM_INJECT_RESPONSE",
        raw: raw.slice(0, 240),
      };
    }
    return json(parsed, response.status);
  } catch (err) {
    return json({
      ok: false,
      reason: "SYSTEM_INJECT_UNREACHABLE",
      details: String(err),
      system: `${SYSTEM_HOST}:${SYSTEM_PORT}`,
    }, 503);
  }
};

const proxyCodex = async (
  incoming: Request,
  path: string,
  search = "",
): Promise<Response> => {
  try {
    const response = await fetch(`${SYSTEM_API_BASE}${path}${search}`, {
      method: "GET",
      headers: buildForwardHeaders(incoming.headers, false),
    });
    const raw = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        ok: false,
        reason: "INVALID_SYSTEM_CODEX_RESPONSE",
        raw: raw.slice(0, 240),
      };
    }
    return json(parsed, response.status);
  } catch (err) {
    return json({
      ok: false,
      reason: "SYSTEM_CODEX_UNREACHABLE",
      details: String(err),
      system: `${SYSTEM_HOST}:${SYSTEM_PORT}`,
    }, 503);
  }
};

const readJsonFile = async (path: string): Promise<unknown> => {
  try {
    return JSON.parse(await Deno.readTextFile(path));
  } catch {
    return [];
  }
};

async function refreshCodexDigest() {
  const [species, chronicles, relics] = await Promise.all([
    readJsonFile("./codex/species/index.json"),
    readJsonFile("./codex/chronicles/index.json"),
    readJsonFile("./codex/relics/index.json"),
  ]);
  codexDigest = {
    species: Array.isArray(species) ? species.slice(0, 8) : [],
    chronicles: Array.isArray(chronicles) ? chronicles.slice(0, 8) : [],
    relics: Array.isArray(relics) ? relics.slice(0, 8) : [],
  };
}

async function scanUniverse() {
  const atoms: any[] = [];
  const bonds: Array<{ source: string; target: string }> = [];

  try {
    for await (const entry of Deno.readDir(ROOT)) {
      if (
        entry.isFile && entry.name.endsWith(".md") &&
        entry.name.startsWith("0x")
      ) {
        const content = await Deno.readTextFile(`${ROOT}/${entry.name}`);
        const metaMatch = content.match(/^---\n([\s\S]+?)\n---/);
        if (metaMatch) {
          try {
            const alpha = parseYaml(metaMatch[1]) as any;
            const eigenvalue = alpha.eigenvalue || entry.name.split(".")[0];
            atoms.push({
              id: eigenvalue,
              symbol: alpha.symbol || entry.name.split(".")[1],
              x: Number(alpha.x) || Math.random() * 800,
              y: Number(alpha.y) || Math.random() * 800,
              energy: Number(alpha.energy) || 0,
              resonance: Number(alpha.resonance) || 0,
              logic: alpha.logic || "00000000",
              thought: alpha.thought || "DRIFTING",
            });

            if (alpha.bonds && Array.isArray(alpha.bonds)) {
              for (const b of alpha.bonds) {
                bonds.push({ source: eigenvalue, target: b });
              }
            }
          } catch (e) {
            // silently ignore parsing errors for individual files
          }
        }
      }
    }
  } catch (e) {
    console.error("Error scanning universe:", e);
  }

  await refreshCodexDigest();
  akashaState = JSON.stringify({
    type: "SYNC",
    data: { atoms, bonds, codex: codexDigest },
  });
  broadcast(akashaState);
}

function broadcast(message: string) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Initial scan
await scanUniverse();

// Periodic full state push (every 1 second)
setInterval(scanUniverse, 1000);

// Also try to watch for file changes to push instantly, but Deno.watchFs can be chatty,
// so we'll rely primarily on the 1s interval for UI smoothness, but trigger scan on watch too.
async function watchUniverse() {
  const watcher = Deno.watchFs(ROOT);
  let debounceTimer: number | null = null;
  for await (const event of watcher) {
    if (event.paths.some((p) => p.endsWith(".md"))) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scanUniverse, 100);
    }
  }
}
watchUniverse(); // background

const reqHandler = async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-omega-control-token",
      },
    });
  }

  if (req.method === "GET" && url.pathname === "/api/telemetry") {
    return proxyTelemetry(req);
  }

  if (req.method === "GET" && url.pathname === "/api/codex") {
    return proxyCodex(req, "/api/codex", url.search);
  }

  if (req.method === "GET" && url.pathname === "/api/codex/narrative") {
    return proxyCodex(req, "/api/codex/narrative", url.search);
  }

  if (
    req.method === "POST" &&
    (url.pathname === "/api/inject" || url.pathname === "/api/inject_plasmid")
  ) {
    return proxyInject(req);
  }

  if (req.headers.get("upgrade") != "websocket") {
    return new Response(
      `Akasha Node active. WebSocket endpoint: ws://${HOST}:${PORT}/ | REST: /api/telemetry, /api/codex, /api/codex/narrative, /api/inject`,
      {
        status: 200,
      },
    );
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onopen = () => {
    console.log("   [👁️ AKASHA] New Observer Connected.");
    clients.add(socket);
    socket.send(akashaState); // send latest state immediately
  };
  socket.onmessage = (e) => {
    // Visualization channel is read-only; ignore client payloads.
  };
  socket.onclose = () => {
    console.log("   [👁️ AKASHA] Observer Disconnected.");
    clients.delete(socket);
  };
  socket.onerror = (e) => console.error("   [⚠️ AKASHA] WebSocket Error:", e);

  return response;
};

Deno.serve({ hostname: HOST, port: PORT }, reqHandler);
console.log(`🌌 Akasha Server listening on ws://${HOST}:${PORT}/`);
