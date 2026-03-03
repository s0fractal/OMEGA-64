// OMEGA-64 | SYSTEM_START.ts | Era 13: ALEPH - Multiverse & Federation
// Orchestrates the Pulse, Breath, and Observer UI in a single memory space.

import { PULSE } from "./PULSE.ts";
import { BREATH } from "./BREATH.ts";
import { MAX_ATOMS, STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { PREDICTION_MARKET } from "./PREDICTION_MARKET.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";

import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { PRNG } from "./PRNG.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { LOGGER } from "./LOGGER.ts";

const UI_PORT = Number(Deno.env.get("PORT")) || 8000;
const HOST = (Deno.env.get("OMEGA_SYSTEM_HOST") ?? "127.0.0.1").trim() ||
  "127.0.0.1";
const UI_PATH = "./ui/index.html";
const parseBool = (raw: string | undefined, fallback: boolean): boolean => {
  if (raw === undefined) return fallback;
  const norm = raw.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") {
    return true;
  }
  if (norm === "0" || norm === "false" || norm === "no" || norm === "off") {
    return false;
  }
  return fallback;
};
const CONTROL_ENABLE = parseBool(
  Deno.env.get("OMEGA_SYSTEM_CONTROL_ENABLE"),
  false,
);
const CONTROL_TOKEN = (Deno.env.get("OMEGA_SYSTEM_CONTROL_TOKEN") ?? "").trim();
const requireControlAuth = (req: Request): Response | null => {
  if (!CONTROL_ENABLE) {
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

LOGGER.info("🛡️ OMEGA-64 | UNIFIED START | ERA 13: ALEPH");
LOGGER.info(
  `🌐 [SYSTEM] Observer host=${HOST}:${UI_PORT} controlEnabled=${CONTROL_ENABLE} tokenRequired=${
    CONTROL_TOKEN.length > 0
  }`,
);

// 1. Initialize Observer UI Server
Deno.serve({ hostname: HOST, port: UI_PORT }, async (req) => {
  const url = new URL(req.url);

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
    const attention = new Float32Array(PHYSICS_ENGINE.attentionBuffer);

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

  if (url.pathname === "/crisis" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const { logicHex } = await req.json();
      const logicBytes = new Uint8Array(8);
      if (logicHex && logicHex.length === 16) {
        for (let i = 0; i < 8; i++) {
          logicBytes[i] = parseInt(logicHex.substr(i * 2, 2), 16);
        }
      } else {
        // Generate a random crisis mutation if none provided
        crypto.getRandomValues(logicBytes);
      }

      PREDICTION_MARKET.startCrisis(logicBytes);
      return new Response("Crisis Initiated", { status: 200 });
    } catch (e) {
      return new Response("Crisis Failed", { status: 400 });
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

      const idx = STATE_MATRIX.findFreeSlot();
      if (idx !== -1) {
        const prng = new PRNG(PRNG.seedFrom(PULSE.currentPulseId, packet.id));
        const { value: vId, next: n1 } = prng.next();
        const { value: vX, next: n2 } = n1.next();
        const { value: vY } = n2.next();

        // Deterministic ID based on seed
        STATE_MATRIX.setId(idx, BigInt(Math.floor(vId * 0xFFFFFFFF)));
        STATE_MATRIX.setEnergy(idx, packet.energy);
        STATE_MATRIX.setResonance(idx, packet.resonance);

        const logicBytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
          logicBytes[i] = parseInt(packet.logic.substr(i * 2, 2), 16);
        }
        STATE_MATRIX.setLogic(idx, logicBytes);

        // Position in a deterministic cluster around the center
        STATE_MATRIX.setX(idx, 700 + (vX - 0.5) * 200);
        STATE_MATRIX.setY(idx, 400 + (vY - 0.5) * 200);

        return new Response("OK", { status: 200 });
      } else {
        return new Response("Matrix Full", { status: 507 });
      }
    } catch (e) {
      return new Response("Federation Failed", { status: 400 });
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
    const body = await req.json();
    const result = await SNAPSHOT_ENGINE.importSnapshot(body.timestamp);
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
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
      LOGGER.info(
        `⚡ [GOD_MODE] Mutation at (${x}, ${y}) | Delta: ${deltaEnergy} | Radius: ${radius}`,
      );

      const r2 = radius * radius;
      for (let i = 0; i < STATE_MATRIX.MAX_ATOMS; i++) {
        if (STATE_MATRIX.getId(i) === 0n) continue;
        const dx = STATE_MATRIX.getX(i) - x;
        const dy = STATE_MATRIX.getY(i) - y;
        if (dx * dx + dy * dy < r2) {
          const current = STATE_MATRIX.getEnergy(i);
          STATE_MATRIX.setEnergy(i, Math.max(0, current + deltaEnergy));
        }
      }
      return new Response("OK", { status: 200 });
    } catch (e) {
      return new Response("Mutation Failed", { status: 400 });
    }
  }

  // 5. Avatar Cursor Sync (POST)
  if (url.pathname === "/avatar" && req.method === "POST") {
    const denied = requireControlAuth(req);
    if (denied) return denied;
    try {
      const { x, y } = await req.json();
      AVATAR_ENGINE.dropPheromone(x, y);
      return new Response("OK", { status: 200 });
    } catch (e) {
      return new Response("Avatar Sync Failed", { status: 400 });
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
