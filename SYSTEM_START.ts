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
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";

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

type RuntimeMetrics = {
  tick: number;
  population: number;
  avgEnergy: number;
  neuralCoherence: number;
};

type DaemonAuditPending = {
  auditId: string;
  action: Exclude<DaemonAction, "OBSERVE">;
  requestedAction: DaemonAction;
  targetX: number;
  targetY: number;
  intensity: number;
  hexCode?: string;
  queued: boolean;
  queueReason: string;
  queuedStatus: number;
  tickApplied: number;
  evaluateAtTick: number;
  baseline: RuntimeMetrics;
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

const DAEMON_POLICY = RUNTIME_POLICY.daemon;
const DAEMON_POLICY_WINDOW_MS = DAEMON_POLICY.policyWindowMs;
const DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW = DAEMON_POLICY.maxActionsPerWindow;
const DAEMON_POLICY_MAX_PHEROMONE_INTENSITY =
  DAEMON_POLICY.maxPheromoneIntensity;
const DAEMON_POLICY_MAX_PLASMID_CHARGE = DAEMON_POLICY.maxPlasmidCharge;
const DAEMON_SAFE_MIN_POPULATION = DAEMON_POLICY.safeMinPopulation;
const DAEMON_SAFE_MIN_AVG_ENERGY = DAEMON_POLICY.safeMinAvgEnergy;
const DAEMON_AUDIT_EFFECT_TICKS = DAEMON_POLICY.auditEffectTicks;
const DAEMON_AUDIT_PATH = DAEMON_POLICY.auditPath;

const ALLOWED_DAEMON_OPCODES = new Set<number>([
  0x00,
  0x01,
  0x02,
  0x03,
  0x04,
  0x05,
  0x10,
  0x11,
  0x12,
  0x80,
  0x81,
  0x83,
  0xA4,
  0xA5,
  0xA6,
  0xA7,
  0xA8,
  0xA9,
  0xAA,
  0xAB,
]);

let daemonWindowStartMs = Date.now();
let daemonActionsInWindow = 0;
let daemonAuditSeq = 0;
const daemonAuditPending: DaemonAuditPending[] = [];

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

const collectRuntimeMetrics = (): RuntimeMetrics => {
  const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
  const active = STATE_MATRIX.getActiveIndices();
  let totalEnergy = 0;
  for (const idx of active) totalEnergy += STATE_MATRIX.getEnergy(idx);
  const avgEnergy = active.length > 0 ? totalEnergy / active.length : 0;
  const rawCoherence = (STATE_MATRIX.getNeuralCoherence?.() ??
    STATE_MATRIX.getClusterSync?.() ??
    0) as number;
  return {
    tick,
    population: active.length,
    avgEnergy: Number(avgEnergy.toFixed(3)),
    neuralCoherence: Number(rawCoherence.toFixed(3)),
  };
};

const isDaemonSafeMode = (
  metrics: RuntimeMetrics,
): { blocked: boolean; reason: string } => {
  if (metrics.population < DAEMON_SAFE_MIN_POPULATION) {
    return {
      blocked: true,
      reason:
        `SAFE_MODE_POPULATION_${metrics.population}_LT_${DAEMON_SAFE_MIN_POPULATION}`,
    };
  }
  if (metrics.avgEnergy < DAEMON_SAFE_MIN_AVG_ENERGY) {
    return {
      blocked: true,
      reason:
        `SAFE_MODE_AVG_ENERGY_${metrics.avgEnergy}_LT_${DAEMON_SAFE_MIN_AVG_ENERGY}`,
    };
  }
  return { blocked: false, reason: "SAFE_MODE_OFF" };
};

const consumeDaemonBudget = (): {
  ok: boolean;
  remaining: number;
  resetInMs: number;
} => {
  const now = Date.now();
  if (now - daemonWindowStartMs >= DAEMON_POLICY_WINDOW_MS) {
    daemonWindowStartMs = now;
    daemonActionsInWindow = 0;
  }
  if (daemonActionsInWindow >= DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW) {
    const elapsed = now - daemonWindowStartMs;
    return {
      ok: false,
      remaining: 0,
      resetInMs: Math.max(0, DAEMON_POLICY_WINDOW_MS - elapsed),
    };
  }
  daemonActionsInWindow++;
  return {
    ok: true,
    remaining: Math.max(
      0,
      DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW - daemonActionsInWindow,
    ),
    resetInMs: Math.max(
      0,
      DAEMON_POLICY_WINDOW_MS - (now - daemonWindowStartMs),
    ),
  };
};

const parseHex8Strict = (value: string): Uint8Array | null => {
  const normalized = value.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{16}$/u.test(normalized)) return null;
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

const evaluatePlasmidPolicy = (
  hexCode: string,
): { ok: boolean; reason: string } => {
  const bytes = parseHex8Strict(hexCode);
  if (!bytes) return { ok: false, reason: "INVALID_HEX_CODE" };
  if (bytes.every((b) => b === 0)) {
    return { ok: false, reason: "PLASMID_ZERO_VECTOR_BLOCKED" };
  }
  const opcode = bytes[0];
  if (!ALLOWED_DAEMON_OPCODES.has(opcode)) {
    return {
      ok: false,
      reason: `PLASMID_OPCODE_BLOCKED_0x${
        opcode.toString(16).toUpperCase().padStart(2, "0")
      }`,
    };
  }
  return { ok: true, reason: "PLASMID_POLICY_OK" };
};

const appendDaemonAudit = async (
  event: Record<string, unknown>,
): Promise<void> => {
  try {
    await Deno.writeTextFile(
      DAEMON_AUDIT_PATH,
      `${JSON.stringify(event)}\n`,
      { append: true, create: true },
    );
  } catch (err) {
    LOGGER.warn(`[DAEMON_AUDIT] append failed: ${String(err)}`);
  }
};

const queueDaemonAudit = (entry: DaemonAuditPending): void => {
  daemonAuditPending.push(entry);
};

const flushDaemonAuditEffects = async (currentTick: number): Promise<void> => {
  if (daemonAuditPending.length === 0) return;
  const remaining: DaemonAuditPending[] = [];
  for (const pending of daemonAuditPending) {
    if (currentTick < pending.evaluateAtTick) {
      remaining.push(pending);
      continue;
    }
    const metrics = collectRuntimeMetrics();
    await appendDaemonAudit({
      event_type: "DAEMON_EFFECT_EVAL",
      audit_id: pending.auditId,
      evaluated_at_tick: currentTick,
      action: pending.action,
      target_x: pending.targetX,
      target_y: pending.targetY,
      baseline: pending.baseline,
      outcome: metrics,
      delta: {
        population: metrics.population - pending.baseline.population,
        avgEnergy: Number(
          (metrics.avgEnergy - pending.baseline.avgEnergy).toFixed(3),
        ),
        neuralCoherence: Number(
          (metrics.neuralCoherence - pending.baseline.neuralCoherence).toFixed(
            3,
          ),
        ),
      },
    });
  }
  daemonAuditPending.length = 0;
  daemonAuditPending.push(...remaining);
};

const buildTelemetry = async () => {
  const metrics = collectRuntimeMetrics();
  const active = STATE_MATRIX.getActiveIndices();
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
  const safeMode = isDaemonSafeMode(metrics);
  const resetInMs = Math.max(
    0,
    DAEMON_POLICY_WINDOW_MS - (Date.now() - daemonWindowStartMs),
  );
  return {
    tick: metrics.tick,
    avgEnergy: metrics.avgEnergy,
    dominantGenomes: dominantGenomes(active, 3),
    voxPopuli,
    daemon_governance: {
      safe_mode: safeMode.blocked,
      safe_mode_reason: safeMode.reason,
      actions_used_in_window: daemonActionsInWindow,
      actions_max_in_window: DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW,
      window_reset_in_ms: resetInMs,
      max_pheromone_intensity: DAEMON_POLICY_MAX_PHEROMONE_INTENSITY,
      max_plasmid_charge: DAEMON_POLICY_MAX_PLASMID_CHARGE,
    },
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

  if (url.pathname === "/api/codex" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "8", 10);
    const snapshot = await AKASHA_CODEX.getSnapshot(
      Number.isFinite(limit) ? limit : 8,
    );
    return new Response(JSON.stringify(snapshot), {
      headers: JSON_HEADERS,
    });
  }

  if (url.pathname === "/api/codex/narrative" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "5", 10);
    const narrative = await AKASHA_CODEX.getNarrative(
      Number.isFinite(limit) ? limit : 5,
    );
    return new Response(JSON.stringify(narrative), {
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
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_inject_invalid_payload",
          count: 1,
        });
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

      const baseline = collectRuntimeMetrics();
      const safeMode = isDaemonSafeMode(baseline);

      if (envelope.action_type === "OBSERVE") {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_observe_noop",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_OBSERVE",
          tick: baseline.tick,
          metrics: baseline,
          safe_mode: safeMode.blocked,
          safe_mode_reason: safeMode.reason,
        });
        return new Response(
          JSON.stringify({
            ok: true,
            status: 200,
            reason: "OBSERVE_NOOP",
            safe_mode: safeMode.blocked,
            safe_mode_reason: safeMode.reason,
          }),
          { status: 200, headers: JSON_HEADERS },
        );
      }

      if (safeMode.blocked) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_safe_mode_block",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_REJECT",
          reason: safeMode.reason,
          tick: baseline.tick,
          action: envelope.action_type,
          payload: envelope.payload,
          metrics: baseline,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: safeMode.reason,
            safe_mode: true,
            status: 429,
          }),
          { status: 429, headers: JSON_HEADERS },
        );
      }

      const budget = consumeDaemonBudget();
      if (!budget.ok) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_rate_limit_block",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_REJECT",
          reason: "DAEMON_RATE_LIMIT_WINDOW_EXCEEDED",
          tick: baseline.tick,
          action: envelope.action_type,
          payload: envelope.payload,
          metrics: baseline,
          budget,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "DAEMON_RATE_LIMIT_WINDOW_EXCEEDED",
            status: 429,
            retry_after_ms: budget.resetInMs,
          }),
          { status: 429, headers: JSON_HEADERS },
        );
      }

      if (envelope.action_type === "DROP_PHEROMONE") {
        if (
          envelope.payload.intensity > DAEMON_POLICY_MAX_PHEROMONE_INTENSITY
        ) {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_block_pheromone_intensity",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "DAEMON_POLICY_PHEROMONE_INTENSITY_EXCEEDED",
              max: DAEMON_POLICY_MAX_PHEROMONE_INTENSITY,
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }
        const queued = CONTROL_INTENT_QUEUE.enqueueAvatar(
          envelope.payload.target_x,
          envelope.payload.target_y,
          envelope.payload.intensity,
          "external_daemon",
        );
        const auditId = `daemon-${baseline.tick}-${++daemonAuditSeq}`;
        if (queued.ok) {
          queueDaemonAudit({
            auditId,
            action: "DROP_PHEROMONE",
            requestedAction: envelope.action_type,
            targetX: envelope.payload.target_x,
            targetY: envelope.payload.target_y,
            intensity: envelope.payload.intensity,
            queued: queued.ok,
            queueReason: queued.reason,
            queuedStatus: queued.status,
            tickApplied: baseline.tick,
            evaluateAtTick: baseline.tick + DAEMON_AUDIT_EFFECT_TICKS,
            baseline,
          });
        }
        await appendDaemonAudit({
          event_type: "DAEMON_ACCEPT",
          audit_id: auditId,
          tick: baseline.tick,
          action: "DROP_PHEROMONE",
          payload: envelope.payload,
          queue: queued,
          metrics: baseline,
          budget,
        });
        return new Response(JSON.stringify(queued), {
          status: queued.status,
          headers: JSON_HEADERS,
        });
      }

      if (!envelope.payload.hex_code) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_block_missing_hex",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_PLASMID_PAYLOAD",
            expected: "hex_code must be 16 hex chars",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (envelope.payload.intensity > DAEMON_POLICY_MAX_PLASMID_CHARGE) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_block_plasmid_charge",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "DAEMON_POLICY_PLASMID_CHARGE_EXCEEDED",
            max: DAEMON_POLICY_MAX_PLASMID_CHARGE,
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const plasmidPolicy = evaluatePlasmidPolicy(envelope.payload.hex_code);
      if (!plasmidPolicy.ok) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_block_plasmid_rule",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: plasmidPolicy.reason,
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const queued = CONTROL_INTENT_QUEUE.enqueuePlasmid(
        envelope.payload.target_x,
        envelope.payload.target_y,
        envelope.payload.hex_code,
        envelope.payload.intensity,
        "external_daemon",
      );
      const auditId = `daemon-${baseline.tick}-${++daemonAuditSeq}`;
      if (queued.ok) {
        queueDaemonAudit({
          auditId,
          action: "INJECT_PLASMID",
          requestedAction: envelope.action_type,
          targetX: envelope.payload.target_x,
          targetY: envelope.payload.target_y,
          intensity: envelope.payload.intensity,
          hexCode: envelope.payload.hex_code,
          queued: queued.ok,
          queueReason: queued.reason,
          queuedStatus: queued.status,
          tickApplied: baseline.tick,
          evaluateAtTick: baseline.tick + DAEMON_AUDIT_EFFECT_TICKS,
          baseline,
        });
      }
      await appendDaemonAudit({
        event_type: "DAEMON_ACCEPT",
        audit_id: auditId,
        tick: baseline.tick,
        action: "INJECT_PLASMID",
        payload: envelope.payload,
        queue: queued,
        metrics: baseline,
        budget,
      });
      return new Response(JSON.stringify(queued), {
        status: queued.status,
        headers: JSON_HEADERS,
      });
    } catch (err) {
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_inject_exception",
        count: 1,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_INJECT_PAYLOAD",
          details: String(err),
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

  if (url.pathname === "/codex/narrative" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "5", 10);
    const narrative = await AKASHA_CODEX.getNarrative(
      Number.isFinite(limit) ? limit : 5,
    );
    return new Response(JSON.stringify(narrative), {
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
    await flushDaemonAuditEffects(Atomics.load(STATE_MATRIX.tickCounter, 0));
    await new Promise((r) => setTimeout(r, 16));
  }
})();

// 3. Start Cognitive Breathing Loop (Background)
(async () => {
  LOGGER.info("🌬️ [SYSTEM] Breathing Daemon Waiting for first pulse...");
  await new Promise((r) => setTimeout(r, 5000));
  await BREATH.inhale();
})();
