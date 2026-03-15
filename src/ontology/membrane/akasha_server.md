---
id: AKASHA_SERVER
type: module
description: "Migrated from src/06/AKASHA_SERVER.ts"
tags: ["standalone", "server"]
deps: []
min_level: 6
---

### TypeScript

```typescript
import { parse as parseYaml } from "jsr:@std/yaml@^1.0.5";
import { RUNTIME_POLICY } from "@generated";
import { AKASHA_SIGNALING } from "@generated";

const PORT = RUNTIME_POLICY.akasha.port;
const HOST = RUNTIME_POLICY.akasha.host;
const SYSTEM_HOST = RUNTIME_POLICY.system.host;
const SYSTEM_PORT = RUNTIME_POLICY.system.port;
const SYSTEM_API_BASE = `http://${SYSTEM_HOST}:${SYSTEM_PORT}`;
const CONTROL_TOKEN = RUNTIME_POLICY.system.controlToken;
const MESH_MAX_PHEROMONE_INTENSITY = RUNTIME_POLICY.daemon
  .maxPheromoneIntensity;
const MESH_MAX_PLASMID_CHARGE = RUNTIME_POLICY.daemon.maxPlasmidCharge;
const MESH_HEX_RE = /^[0-9a-fA-F]{16}$/u;
const MESH_WORLD_MAX_X = 1399;
const MESH_WORLD_MAX_Y = 799;
const ROOT = "./";
const REST_JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
} as const;


let clients = new Set<WebSocket>();

// Store the latest state of the universe
let akashaState: string = "{}";
let codexDigest: {
  species: unknown[];
  chronicles: unknown[];
  relics: unknown[];
  invariants: unknown[];
} = { species: [], chronicles: [], relics: [], invariants: [] };

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

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

type MeshForwardAction = "DROP_PHEROMONE" | "INJECT_PLASMID";
type MeshForwardEnvelope = {
  action_type: MeshForwardAction;
  payload: {
    target_x: number;
    target_y: number;
    intensity: number;
    hex_code?: string;
  };
};

type ParsedMeshInject = {
  envelope: MeshForwardEnvelope;
  signalType: "mesh_pheromone" | "mesh_plasmid";
  eventId: string;
  sourcePeer: string;
};

const parseMeshInjectBody = (raw: unknown): ParsedMeshInject | null => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const root = raw as Record<string, unknown>;
  const payloadRaw = root.payload;
  if (
    !payloadRaw || typeof payloadRaw !== "object" || Array.isArray(payloadRaw)
  ) {
    return null;
  }
  const payload = payloadRaw as Record<string, unknown>;

  const sourceType = typeof root.type === "string"
    ? root.type.trim().toLowerCase()
    : "";
  const explicitAction = typeof root.action_type === "string"
    ? root.action_type.trim().toUpperCase()
    : "";

  const action: MeshForwardAction = explicitAction === "INJECT_PLASMID" ||
      sourceType === "mesh_plasmid"
    ? "INJECT_PLASMID"
    : "DROP_PHEROMONE";
  const signalType = action === "INJECT_PLASMID"
    ? "mesh_plasmid"
    : "mesh_pheromone";

  const x = toFiniteNumber(payload.target_x);
  const y = toFiniteNumber(payload.target_y);
  if (x === null || y === null) return null;

  const intensityRaw = toFiniteNumber(payload.intensity);
  const fallbackIntensity = action === "INJECT_PLASMID" ? 1000 : 120;
  const maxIntensity = action === "INJECT_PLASMID"
    ? MESH_MAX_PLASMID_CHARGE
    : MESH_MAX_PHEROMONE_INTENSITY;
  const intensity = clamp(
    Math.round(intensityRaw === null ? fallbackIntensity : intensityRaw),
    1,
    maxIntensity,
  );

  const target_x = clamp(Math.round(x), 0, MESH_WORLD_MAX_X);
  const target_y = clamp(Math.round(y), 0, MESH_WORLD_MAX_Y);

  let hex_code: string | undefined = undefined;
  if (action === "INJECT_PLASMID") {
    const rawHex = typeof payload.hex_code === "string"
      ? payload.hex_code.trim()
      : "";
    if (!MESH_HEX_RE.test(rawHex)) return null;
    hex_code = rawHex.toUpperCase();
  }

  const eventIdRaw = typeof root.event_id === "string" ? root.event_id : "";
  const sourcePeerRaw = typeof root.source_peer === "string"
    ? root.source_peer
    : "";
  const eventId = eventIdRaw.trim().slice(0, 96);
  const sourcePeer = sourcePeerRaw.trim().slice(0, 96);

  return {
    envelope: {
      action_type: action,
      payload: {
        target_x,
        target_y,
        intensity,
        ...(hex_code ? { hex_code } : {}),
      },
    },
    signalType,
    eventId,
    sourcePeer,
  };
};

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

const proxyTelemetryPath = async (
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

const proxyPressureRing = async (incoming: Request): Promise<Response> => {
  const method = incoming.method.toUpperCase();
  if (method !== "GET" && method !== "POST") {
    return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, 405);
  }
  let bodyText = "";
  if (method === "POST") {
    try {
      bodyText = await incoming.text();
    } catch {
      return json({ ok: false, reason: "INVALID_JSON_BODY" }, 400);
    }
    if (bodyText.trim().length === 0) {
      return json({ ok: false, reason: "EMPTY_REQUEST_BODY" }, 400);
    }
  }

  try {
    const response = await fetch(`${SYSTEM_API_BASE}/api/pressure-ring`, {
      method,
      headers: buildForwardHeaders(incoming.headers, method === "POST"),
      body: method === "POST" ? bodyText : undefined,
    });
    const raw = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        ok: false,
        reason: "INVALID_SYSTEM_PRESSURE_RING_RESPONSE",
        raw: raw.slice(0, 240),
      };
    }
    return json(parsed, response.status);
  } catch (err) {
    return json({
      ok: false,
      reason: "SYSTEM_PRESSURE_RING_UNREACHABLE",
      details: String(err),
      system: `${SYSTEM_HOST}:${SYSTEM_PORT}`,
    }, 503);
  }
};

const proxyHomeostasis = async (incoming: Request): Promise<Response> => {
  const method = incoming.method.toUpperCase();
  if (method !== "GET" && method !== "POST") {
    return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, 405);
  }
  let bodyText = "";
  if (method === "POST") {
    try {
      bodyText = await incoming.text();
    } catch {
      return json({ ok: false, reason: "INVALID_JSON_BODY" }, 400);
    }
    if (bodyText.trim().length === 0) {
      return json({ ok: false, reason: "EMPTY_REQUEST_BODY" }, 400);
    }
  }

  try {
    const response = await fetch(`${SYSTEM_API_BASE}/api/homeostasis`, {
      method,
      headers: buildForwardHeaders(incoming.headers, method === "POST"),
      body: method === "POST" ? bodyText : undefined,
    });
    const raw = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        ok: false,
        reason: "INVALID_SYSTEM_HOMEOSTASIS_RESPONSE",
        raw: raw.slice(0, 240),
      };
    }
    return json(parsed, response.status);
  } catch (err) {
    return json({
      ok: false,
      reason: "SYSTEM_HOMEOSTASIS_UNREACHABLE",
      details: String(err),
      system: `${SYSTEM_HOST}:${SYSTEM_PORT}`,
    }, 503);
  }
};

const proxyDaemonPolicy = async (incoming: Request): Promise<Response> => {
  const method = incoming.method.toUpperCase();
  if (method !== "GET" && method !== "POST") {
    return json({ ok: false, reason: "METHOD_NOT_ALLOWED" }, 405);
  }
  let bodyText = "";
  if (method === "POST") {
    try {
      bodyText = await incoming.text();
    } catch {
      return json({ ok: false, reason: "INVALID_JSON_BODY" }, 400);
    }
    if (bodyText.trim().length === 0) {
      return json({ ok: false, reason: "EMPTY_REQUEST_BODY" }, 400);
    }
  }

  try {
    const response = await fetch(`${SYSTEM_API_BASE}/api/daemon-policy`, {
      method,
      headers: buildForwardHeaders(incoming.headers, method === "POST"),
      body: method === "POST" ? bodyText : undefined,
    });
    const raw = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        ok: false,
        reason: "INVALID_SYSTEM_DAEMON_POLICY_RESPONSE",
        raw: raw.slice(0, 240),
      };
    }
    return json(parsed, response.status);
  } catch (err) {
    return json({
      ok: false,
      reason: "SYSTEM_DAEMON_POLICY_UNREACHABLE",
      details: String(err),
      system: `${SYSTEM_HOST}:${SYSTEM_PORT}`,
    }, 503);
  }
};

const proxyPhysiology = async (): Promise<Response> => {
  try {
    const response = await fetch(`${SYSTEM_API_BASE}/api/physiology`, {
      method: "GET",
      headers: buildForwardHeaders(new Headers(), false),
    });
    const raw = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        ok: false,
        reason: "INVALID_SYSTEM_PHYSIOLOGY_RESPONSE",
        raw: raw.slice(0, 240),
      };
    }
    return json(parsed, response.status);
  } catch (err) {
    return json({
      ok: false,
      reason: "SYSTEM_PHYSIOLOGY_UNREACHABLE",
      details: String(err),
      system: `${SYSTEM_HOST}:${SYSTEM_PORT}`,
    }, 503);
  }
};

const proxyWebRtcInject = async (incoming: Request): Promise<Response> => {
  let parsedBody: unknown = null;
  try {
    parsedBody = await incoming.json();
  } catch {
    return json({ ok: false, reason: "INVALID_JSON_BODY" }, 400);
  }

  const parsed = parseMeshInjectBody(parsedBody);
  if (!parsed) {
    return json({
      ok: false,
      reason: "INVALID_WEBRTC_INJECT_PAYLOAD",
      expected:
        "payload {target_x,target_y,intensity,hex_code?} + type mesh_pheromone|mesh_plasmid",
    }, 400);
  }

  try {
    const response = await fetch(`${SYSTEM_API_BASE}/api/inject`, {
      method: "POST",
      headers: buildForwardHeaders(incoming.headers, true),
      body: JSON.stringify(parsed.envelope),
    });
    const raw = await response.text();
    let systemResponse: unknown = null;
    try {
      systemResponse = JSON.parse(raw);
    } catch {
      systemResponse = {
        ok: false,
        reason: "INVALID_SYSTEM_INJECT_RESPONSE",
        raw: raw.slice(0, 240),
      };
    }
    return json({
      ok: response.ok,
      mesh_ingress: true,
      signal_type: parsed.signalType,
      event_id: parsed.eventId,
      source_peer: parsed.sourcePeer,
      forwarded: parsed.envelope,
      system: systemResponse,
    }, response.status);
  } catch (err) {
    return json({
      ok: false,
      reason: "SYSTEM_INJECT_UNREACHABLE",
      details: String(err),
      system: `${SYSTEM_HOST}:${SYSTEM_PORT}`,
      mesh_ingress: true,
      signal_type: parsed.signalType,
      event_id: parsed.eventId,
      source_peer: parsed.sourcePeer,
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
  const [species, chronicles, relics, invariants] = await Promise.all([
    readJsonFile("./codex/species/index.json"),
    readJsonFile("./codex/chronicles/index.json"),
    readJsonFile("./codex/relics/index.json"),
    readJsonFile("./codex/invariants/index.json"),
  ]);
  codexDigest = {
    species: Array.isArray(species) ? species.slice(0, 8) : [],
    chronicles: Array.isArray(chronicles) ? chronicles.slice(0, 8) : [],
    relics: Array.isArray(relics) ? relics.slice(0, 8) : [],
    invariants: Array.isArray(invariants) ? invariants.slice(0, 8) : [],
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

if (import.meta.main) {
  await scanUniverse();
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
}

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

  if (req.method === "GET" && url.pathname === "/api/telemetry/stream") {
    return proxyTelemetryPath(req, "/api/telemetry/stream", url.search);
  }

  if (req.method === "GET" && url.pathname === "/api/telemetry/histogram") {
    return proxyTelemetryPath(req, "/api/telemetry/histogram", url.search);
  }

  if (req.method === "GET" && url.pathname === "/api/mutation-telemetry") {
    return proxyTelemetryPath(req, "/api/mutation-telemetry", url.search);
  }

  if (
    (req.method === "GET" || req.method === "POST") &&
    url.pathname === "/api/pressure-ring"
  ) {
    return proxyPressureRing(req);
  }

  if (
    (req.method === "GET" || req.method === "POST") &&
    url.pathname === "/api/homeostasis"
  ) {
    return proxyHomeostasis(req);
  }

  if (
    (req.method === "GET" || req.method === "POST") &&
    url.pathname === "/api/daemon-policy"
  ) {
    return proxyDaemonPolicy(req);
  }

  if (req.method === "GET" && url.pathname === "/api/physiology") {
    return proxyPhysiology();
  }

  if (req.method === "GET" && url.pathname === "/api/codex") {
    return proxyCodex(req, "/api/codex", url.search);
  }

  if (req.method === "GET" && url.pathname === "/api/codex/narrative") {
    return proxyCodex(req, "/api/codex/narrative", url.search);
  }

  if (req.method === "GET" && url.pathname === "/api/codex/invariants") {
    return proxyCodex(req, "/api/codex/invariants", url.search);
  }

  if (req.method === "GET" && url.pathname === "/api/webrtc") {
    return json(AKASHA_SIGNALING.status());
  }

  if (req.method === "POST" && url.pathname === "/api/webrtc/inject") {
    return proxyWebRtcInject(req);
  }

  if (
    req.method === "POST" &&
    (url.pathname === "/api/inject" || url.pathname === "/api/inject_plasmid")
  ) {
    return proxyInject(req);
  }

  if (req.headers.get("upgrade") != "websocket") {
    return new Response(
      `Akasha Node active. WebSocket endpoints: ws://${HOST}:${PORT}/, ws://${HOST}:${PORT}${AKASHA_SIGNALING.path} | REST: /api/telemetry, /api/telemetry/stream, /api/telemetry/histogram, /api/mutation-telemetry, /api/pressure-ring, /api/homeostasis, /api/daemon-policy, /api/physiology, /api/codex, /api/codex/narrative, /api/codex/invariants, /api/inject, /api/webrtc, /api/webrtc/inject`,
      {
        status: 200,
      },
    );
  }

  if (url.pathname === AKASHA_SIGNALING.path) {
    const { socket, response } = Deno.upgradeWebSocket(req);
    AKASHA_SIGNALING.attach(socket);
    return response;
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

if (import.meta.main) {
  RUNTIME_POLICY.logFingerprintOnce("akasha-server");
  Deno.serve({ hostname: HOST, port: PORT }, reqHandler);
  console.log(`🌌 Akasha Server listening on ws://${HOST}:${PORT}/`);
}
```
