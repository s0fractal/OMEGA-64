// OMEGA-64 | SYSTEM_START.ts | Era 13: ALEPH - Multiverse & Federation
// Orchestrates the Pulse, Breath, and Observer UI in a single memory space.

import { PULSE } from "./PULSE.ts";
import { BREATH } from "./BREATH.ts";
import { MAX_ATOMS, STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { CONTROL_INTENT_QUEUE } from "./CONTROL_INTENT_QUEUE.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { LOGGER } from "./LOGGER.ts";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";
import { AKASHA_CODEX } from "./AKASHA_CODEX.ts";

const UI_PORT = RUNTIME_POLICY.system.port;
const HOST = RUNTIME_POLICY.system.host;
const UI_PATH = "./ui/index.html";
const CONTROL_ENABLE = RUNTIME_POLICY.system.controlEnabled;
const CONTROL_TOKEN = RUNTIME_POLICY.system.controlToken;
const AVATAR_INGRESS_ENABLE = RUNTIME_POLICY.system.avatarIngressEnabled;
const GRID_W = 140;
const GRID_H = 80;
const WORLD_W = GRID_W * 10;
const WORLD_H = GRID_H * 10;
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
} as const;

type DaemonAction = "DROP_PHEROMONE" | "INJECT_PLASMID" | "OBSERVE";

type DaemonInjectEnvelope = {
  action_type: DaemonAction;
  payload: {
    target_x: number;
    target_y: number;
    intensity: number;
    hex_code?: string;
  };
};

const requireControlAuth = (req: Request): Response | null => {
  const path = new URL(req.url).pathname;
  const isAvatarIngress = path === "/avatar";
  if (!CONTROL_ENABLE) {
    if (isAvatarIngress && AVATAR_INGRESS_ENABLE) {
      return null;
    }
    return new Response("Control plane disabled", { status: 403 });
  }
  if (CONTROL_TOKEN.length === 0) {
    return null;
  }
  const provided = (req.headers.get("x-omega-control-token") ?? "").trim();
  if (provided !== CONTROL_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
};

const requireDaemonAuth = (req: Request): Response | null => {
  if (!CONTROL_ENABLE || CONTROL_TOKEN.length === 0) return null;
  const provided = (req.headers.get("x-omega-control-token") ?? "").trim();
  if (provided !== CONTROL_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
};

const asFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const logicToHex = (logic: Uint8Array): string =>
  Array.from(logic).map((b) => b.toString(16).padStart(2, "0")).join("")
    .toUpperCase();

const dominantGenomes = (active: number[], limit = 3): string[] => {
  const counts = new Map<string, number>();
  for (const idx of active) {
    const hex = logicToHex(STATE_MATRIX.getLogic(idx));
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([hex]) => hex);
};

const buildTelemetry = async () => {
  const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
  const active = STATE_MATRIX.getActiveIndices();
  let totalEnergy = 0;
  for (const idx of active) totalEnergy += STATE_MATRIX.getEnergy(idx);
  const avgEnergy = active.length > 0
    ? Number((totalEnergy / active.length).toFixed(3))
    : 0;
  let voxPopuli: string[] = [];
  try {
    const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
    if (Array.isArray(vox)) {
      voxPopuli = vox
        .filter((entry): entry is string => typeof entry === "string")
        .slice(0, 8);
    }
  } catch {
    voxPopuli = [];
  }
  return {
    tick,
    avgEnergy,
    dominantGenomes: dominantGenomes(active, 3),
    voxPopuli,
  };
};

const parseDaemonInjectEnvelope = (
  body: unknown,
): DaemonInjectEnvelope | null => {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const payloadSource = root.payload && typeof root.payload === "object"
    ? root.payload as Record<string, unknown>
    : root;

  const actionRaw = typeof root.action_type === "string"
    ? root.action_type
    : typeof root.type === "string"
    ? root.type
    : typeof payloadSource.hex_code === "string"
    ? "INJECT_PLASMID"
    : "DROP_PHEROMONE";
  const action = actionRaw.trim().toUpperCase();
  if (
    action !== "DROP_PHEROMONE" && action !== "INJECT_PLASMID" &&
    action !== "OBSERVE"
  ) {
    return null;
  }

  const x = clamp(
    Math.round(asFiniteNumber(payloadSource.target_x ?? payloadSource.x, 700)),
    0,
    WORLD_W - 1,
  );
  const y = clamp(
    Math.round(asFiniteNumber(payloadSource.target_y ?? payloadSource.y, 400)),
    0,
    WORLD_H - 1,
  );
  const intensity = clamp(
    asFiniteNumber(payloadSource.intensity ?? payloadSource.charge, 100),
    1,
    2000,
  );
  const hexCode = typeof payloadSource.hex_code === "string"
    ? payloadSource.hex_code
    : typeof payloadSource.plasmid_hex === "string"
    ? payloadSource.plasmid_hex
    : undefined;

  return {
    action_type: action as DaemonAction,
    payload: {
      target_x: x,
      target_y: y,
      intensity,
      hex_code: hexCode,
    },
  };
};

LOGGER.info("🛡️ OMEGA-64 | UNIFIED START | ERA 13: ALEPH");
RUNTIME_POLICY.logFingerprintOnce("system-start");
LOGGER.info(
  `🌐 [SYSTEM] Observer host=${HOST}:${UI_PORT} controlEnabled=${CONTROL_ENABLE} avatarIngress=${AVATAR_INGRESS_ENABLE} tokenRequired=${
    CONTROL_TOKEN.length > 0
  }`,
);
await AKASHA_CODEX.start();

// 1. Initialize Observer UI Server
Deno.serve({ hostname: HOST, port: UI_PORT }, async (req) => {
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

  if (url.pathname === "/state") {
    const buffer = STATE_MATRIX.buffer;

    const bufferCopy = new Uint8Array(buffer.byteLength);
    bufferCopy.set(new Uint8Array(buffer));
    return new Response(bufferCopy, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  }

  if (url.pathname === "/grid") {
    const env = new Int32Array(PHYSICS_ENGINE.envBuffer);
    const attention = PHYSICS_ENGINE.ATTENTION_PHEROMONES;

    const buffer = new ArrayBuffer(env.byteLength + attention.byteLength);
    const outEnv = new Int32Array(buffer, 0, env.length);
    const outAttention = new Float32Array(
      buffer,
      env.byteLength,
      attention.length,
    );

    outEnv.set(env);
    outAttention.set(attention);

    return new Response(buffer, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  }

  if (url.pathname === "/api/telemetry" && req.method === "GET") {
    return new Response(JSON.stringify(await buildTelemetry()), {
      headers: JSON_HEADERS,
    });
  }

  if (url.pathname === "/api/inject" && req.method === "POST") {
    const denied = requireDaemonAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const envelope = parseDaemonInjectEnvelope(body);
      if (!envelope) {
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_INJECT_PAYLOAD",
            expected:
              "Provide action_type and payload {target_x,target_y,intensity,hex_code?}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (envelope.action_type === "OBSERVE") {
        return new Response(
          JSON.stringify({ ok: true, status: 200, reason: "OBSERVE_NOOP" }),
          { status: 200, headers: JSON_HEADERS },
        );
      }

      if (envelope.action_type === "DROP_PHEROMONE") {
        const queued = CONTROL_INTENT_QUEUE.enqueueAvatar(
          envelope.payload.target_x,
          envelope.payload.target_y,
          envelope.payload.intensity,
        );
        return new Response(JSON.stringify(queued), {
          status: queued.status,
          headers: JSON_HEADERS,
        });
      }

      if (!envelope.payload.hex_code) {
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_PLASMID_PAYLOAD",
            expected: "hex_code must be 16 hex chars",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const queued = CONTROL_INTENT_QUEUE.enqueuePlasmid(
        envelope.payload.target_x,
        envelope.payload.target_y,
        envelope.payload.hex_code,
        envelope.payload.intensity,
      );
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: JSON_HEADERS,
      });
    } catch {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_INJECT_PAYLOAD",
        }),
        { status: 400, headers: JSON_HEADERS },
      );
    }
  }

  if (url.pathname === "/crisis" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const queued = CONTROL_INTENT_QUEUE.enqueueCrisis(body?.logicHex);
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_CRISIS_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (url.pathname === "/federate" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const packet = await req.json();
      LOGGER.info(
        `🛸 [FEDERATION] Incoming migration from ${packet.sourceNode}: ${packet.id}`,
      );
      const queued = CONTROL_INTENT_QUEUE.enqueueFederate(
        packet,
        PULSE.currentPulseId,
      );
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_FEDERATE_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (url.pathname === "/peers") {
    return new Response(JSON.stringify(Array.from(P2P_FEDERATION.peers)), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/vox") {
    return new Response(
      JSON.stringify(await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd())),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (url.pathname === "/thoughts") {
    return new Response(
      JSON.stringify(Object.fromEntries(SEMANTIC_MEMBRANE.thoughtArchive)),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (url.pathname === "/snapshots" && req.method === "GET") {
    const list = await SNAPSHOT_ENGINE.listSnapshots();
    return new Response(JSON.stringify(list), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/governance" && req.method === "GET") {
    return new Response(JSON.stringify(SOVEREIGNTY_ENGINE.currentRegent), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/lineage" && req.method === "GET") {
    return new Response(
      JSON.stringify(Object.fromEntries(SEMANTIC_MEMBRANE.lineage)),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  if (url.pathname === "/codex" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "8", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 8,
    );
    return new Response(JSON.stringify(snapshot), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/codex/species" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "16", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 16,
    );
    return new Response(JSON.stringify(snapshot.species), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/codex/chronicles" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "16", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 16,
    );
    return new Response(JSON.stringify(snapshot.chronicles), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/codex/relics" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "16", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 16,
    );
    return new Response(JSON.stringify(snapshot.relics), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/viral" && req.method === "GET") {
    // @ts-ignore: viralGridBuffer is dynamically exposed
    return new Response(STATE_MATRIX.viralGridBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/immunity" && req.method === "GET") {
    const buffer = STATE_MATRIX.immuneBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/signals" && req.method === "GET") {
    const buffer = STATE_MATRIX.currentReadBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/stiffness" && req.method === "GET") {
    const buffer = STATE_MATRIX.bondStiffnessBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/bonds" && req.method === "GET") {
    const BONDS_OFFSET = OFFSETS.BONDS_OFFSET;
    const BONDS_SIZE = MAX_ATOMS * 4 * 4;
    const view = new Uint8Array(STATE_MATRIX.buffer, BONDS_OFFSET, BONDS_SIZE);
    const copy = new Uint8Array(view.byteLength);
    copy.set(view);
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/synapses" && req.method === "GET") {
    const buffer = STATE_MATRIX.synapticStackBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/architecture" && req.method === "GET") {
    const buffer = STATE_MATRIX.structureGridBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/memory" && req.method === "GET") {
    const buffer = STATE_MATRIX.memoryGridBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/roles" && req.method === "GET") {
    const buffer = STATE_MATRIX.roleRegistryBuffer;
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer));
    return new Response(copy, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/snapshot/export" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    const result = await SNAPSHOT_ENGINE.exportSnapshot();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/snapshot/import" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const queued = CONTROL_INTENT_QUEUE.enqueueSnapshotImport(
        body?.timestamp,
      );
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_SNAPSHOT_IMPORT_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // 3. Direct Thought Injection (POST) - OBSOLETE in Era 18
  /*
    if (url.pathname === "/inject" && req.method === "POST") {
        try {
            const { text, energy } = await req.json();
            LOGGER.info(`💉 [GOD_MODE] Injecting: "${text}" (Energy: ${energy})`);
            await SEMANTIC_MEMBRANE.injectThought(text, energy || 100);
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response("Injection Failed", { status: 400 });
        }
    }
    */

  // 4. Spatial Mutation (POST)
  if (url.pathname === "/mutate" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const { x, y, deltaEnergy, radius } = await req.json();
      const queued = CONTROL_INTENT_QUEUE.enqueueMutate(
        x,
        y,
        deltaEnergy,
        radius,
      );
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_MUTATE_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // 5. Avatar Cursor Sync (POST)
  if (url.pathname === "/avatar" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const { x, y } = await req.json();
      const queued = CONTROL_INTENT_QUEUE.enqueueAvatar(x, y);
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_AVATAR_PAYLOAD",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  try {
    const html = await Deno.readTextFile(UI_PATH);
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  } catch (e) {
    return new Response("UI not found.", { status: 404 });
  }
});

// 2. Start Simulation Pulse Loop (Background)
(async () => {
  LOGGER.info("💓 [SYSTEM] Pulse Engine Ignited.");
  await PULSE.initWorkers();

  while (true) {
    await PULSE.tick();
    await new Promise((r) => setTimeout(r, 16));
  }
})();

// 3. Start Cognitive Breathing Loop (Background)
(async () => {
  LOGGER.info("🌬️ [SYSTEM] Breathing Daemon Waiting for first pulse...");
  await new Promise((r) => setTimeout(r, 5000));
  await BREATH.inhale();
})();
