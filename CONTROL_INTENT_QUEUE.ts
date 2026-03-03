import { MAX_ATOMS, STATE_MATRIX } from "./STATE_MATRIX.ts";
import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { LOGGER } from "./LOGGER.ts";
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";
import { PREDICTION_MARKET } from "./PREDICTION_MARKET.ts";
import { PRNG } from "./PRNG.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { parseEnvBoundedInt } from "./ENV_PARSE.ts";

type CrisisIntent = {
  kind: "crisis";
  logicBytes: Uint8Array;
};

type FederateIntent = {
  kind: "federate";
  packet: {
    id: string;
    logicBytes: Uint8Array;
    energy: number;
    resonance: number;
    sourceNode: string;
    pulseId: number;
  };
  seedPulseId: number;
};

type MutateIntent = {
  kind: "mutate";
  x: number;
  y: number;
  deltaEnergy: number;
  radius: number;
};

type AvatarIntent = {
  kind: "avatar";
  x: number;
  y: number;
};

type SnapshotImportIntent = {
  kind: "snapshot_import";
  timestamp: string;
};

type ControlIntent =
  | CrisisIntent
  | FederateIntent
  | MutateIntent
  | AvatarIntent
  | SnapshotImportIntent;

type QueueDecision = {
  ok: boolean;
  status: number;
  reason: string;
  size: number;
  max: number;
};

type ApplyStats = {
  drained: number;
  applied: number;
  failed: number;
  remaining: number;
};

const MAX_PENDING = parseEnvBoundedInt(
  Deno.env.get("OMEGA_CONTROL_INTENT_MAX"),
  512,
  8,
  100_000,
);
const APPLY_BUDGET_PER_TICK = parseEnvBoundedInt(
  Deno.env.get("OMEGA_CONTROL_INTENT_BUDGET"),
  8,
  1,
  4096,
);

const queue: ControlIntent[] = [];

const decision = (
  ok: boolean,
  status: number,
  reason: string,
): QueueDecision => ({
  ok,
  status,
  reason,
  size: queue.length,
  max: MAX_PENDING,
});

const enqueueInternal = (intent: ControlIntent): QueueDecision => {
  if (queue.length >= MAX_PENDING) {
    MUTATION_TELEMETRY.record({
      lane: "external_ingress",
      kind: "control_intent_reject_full",
      count: 1,
    });
    return decision(false, 503, "CONTROL_INTENT_QUEUE_FULL");
  }
  queue.push(intent);
  MUTATION_TELEMETRY.record({
    lane: "external_ingress",
    kind: "control_intent_enqueued",
    count: 1,
  });
  return decision(true, 202, "QUEUED");
};

const parseHex8 = (value: unknown): Uint8Array | null => {
  if (typeof value !== "string") return null;
  const hex = value.trim();
  if (!/^[0-9a-fA-F]{16}$/u.test(hex)) return null;
  const out = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const parseFiniteNumber = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
};

const applyFederateIntent = (intent: FederateIntent): boolean => {
  const idx = STATE_MATRIX.findFreeSlot();
  if (idx < 0) {
    LOGGER.warn(
      `🛸 [FEDERATION] Queue apply skipped for ${intent.packet.id}: matrix full.`,
    );
    return false;
  }

  const prng = new PRNG(PRNG.seedFrom(intent.seedPulseId, intent.packet.id));
  const { value: vId, next: n1 } = prng.next();
  const { value: vX, next: n2 } = n1.next();
  const { value: vY } = n2.next();

  STATE_MATRIX.setId(idx, BigInt(Math.floor(vId * 0xFFFFFFFF)));
  STATE_MATRIX.setEnergy(idx, intent.packet.energy);
  STATE_MATRIX.setResonance(idx, intent.packet.resonance);
  STATE_MATRIX.setLogic(idx, intent.packet.logicBytes);
  STATE_MATRIX.setX(idx, 700 + (vX - 0.5) * 200);
  STATE_MATRIX.setY(idx, 400 + (vY - 0.5) * 200);

  LOGGER.info(
    `🛸 [FEDERATION] Applied queued migration from ${intent.packet.sourceNode}: ${intent.packet.id}`,
  );
  return true;
};

const applyMutateIntent = (intent: MutateIntent): boolean => {
  const r2 = intent.radius * intent.radius;
  let affected = 0;
  for (let i = 0; i < MAX_ATOMS; i++) {
    if (STATE_MATRIX.getId(i) === 0n) continue;
    const dx = STATE_MATRIX.getX(i) - intent.x;
    const dy = STATE_MATRIX.getY(i) - intent.y;
    if (dx * dx + dy * dy >= r2) continue;
    const current = STATE_MATRIX.getEnergy(i);
    STATE_MATRIX.setEnergy(i, Math.max(0, current + intent.deltaEnergy));
    affected++;
  }
  MUTATION_TELEMETRY.record({
    lane: "external_ingress",
    kind: "control_mutate_apply_targets",
    count: affected,
  });
  return true;
};

const applyIntent = async (intent: ControlIntent): Promise<boolean> => {
  switch (intent.kind) {
    case "crisis":
      PREDICTION_MARKET.startCrisis(intent.logicBytes);
      return true;
    case "federate":
      return applyFederateIntent(intent);
    case "mutate":
      return applyMutateIntent(intent);
    case "avatar":
      AVATAR_ENGINE.dropPheromone(intent.x, intent.y);
      return true;
    case "snapshot_import": {
      const result = await SNAPSHOT_ENGINE.importSnapshot(intent.timestamp);
      return result.success === true;
    }
  }
};

export const CONTROL_INTENT_QUEUE = {
  config: {
    maxPending: MAX_PENDING,
    applyBudgetPerTick: APPLY_BUDGET_PER_TICK,
  },
  size: (): number => queue.length,
  enqueueCrisis: (logicHex: unknown): QueueDecision => {
    const explicit = parseHex8(logicHex);
    const logicBytes = explicit ?? crypto.getRandomValues(new Uint8Array(8));
    return enqueueInternal({ kind: "crisis", logicBytes });
  },
  enqueueFederate: (packet: unknown, seedPulseId: number): QueueDecision => {
    if (!packet || typeof packet !== "object") {
      return decision(false, 400, "INVALID_FEDERATE_PACKET");
    }
    const p = packet as Record<string, unknown>;
    const id = typeof p.id === "string" ? p.id.trim() : "";
    const sourceNode = typeof p.sourceNode === "string"
      ? p.sourceNode
      : "unknown";
    const logicBytes = parseHex8(p.logic);
    const energy = parseFiniteNumber(p.energy);
    const resonance = parseFiniteNumber(p.resonance);
    const pulseId = Number.isInteger(p.pulseId)
      ? Number(p.pulseId)
      : Math.max(0, Math.floor(seedPulseId));

    if (!id || !logicBytes || energy === null || resonance === null) {
      return decision(false, 400, "INVALID_FEDERATE_PACKET");
    }
    return enqueueInternal({
      kind: "federate",
      packet: {
        id,
        logicBytes,
        energy,
        resonance,
        sourceNode,
        pulseId,
      },
      seedPulseId: Math.max(0, Math.floor(seedPulseId)),
    });
  },
  enqueueMutate: (
    x: unknown,
    y: unknown,
    deltaEnergy: unknown,
    radius: unknown,
  ): QueueDecision => {
    const px = parseFiniteNumber(x);
    const py = parseFiniteNumber(y);
    const pDelta = parseFiniteNumber(deltaEnergy);
    const pRadius = parseFiniteNumber(radius);
    if (px === null || py === null || pDelta === null || pRadius === null) {
      return decision(false, 400, "INVALID_MUTATE_PAYLOAD");
    }
    if (pRadius <= 0) return decision(false, 400, "INVALID_MUTATE_RADIUS");
    return enqueueInternal({
      kind: "mutate",
      x: px,
      y: py,
      deltaEnergy: pDelta,
      radius: pRadius,
    });
  },
  enqueueAvatar: (x: unknown, y: unknown): QueueDecision => {
    const px = parseFiniteNumber(x);
    const py = parseFiniteNumber(y);
    if (px === null || py === null) {
      return decision(false, 400, "INVALID_AVATAR_PAYLOAD");
    }
    return enqueueInternal({ kind: "avatar", x: px, y: py });
  },
  enqueueSnapshotImport: (timestamp: unknown): QueueDecision => {
    if (typeof timestamp !== "string" || timestamp.trim().length === 0) {
      return decision(false, 400, "INVALID_SNAPSHOT_TIMESTAMP");
    }
    return enqueueInternal({
      kind: "snapshot_import",
      timestamp: timestamp.trim(),
    });
  },
  applyHostLockBudget: async (): Promise<ApplyStats> => {
    let drained = 0;
    let applied = 0;
    let failed = 0;
    while (drained < APPLY_BUDGET_PER_TICK && queue.length > 0) {
      const intent = queue.shift()!;
      drained++;
      const ok = await applyIntent(intent);
      MUTATION_TELEMETRY.record({
        lane: "external_ingress",
        kind: ok ? "control_intent_applied" : "control_intent_apply_failed",
        count: 1,
      });
      if (ok) applied++;
      else failed++;
    }
    if (failed > 0) {
      LOGGER.warn(
        `[CONTROL] host-lock apply failures=${failed} drained=${drained} remaining=${queue.length}`,
      );
    }
    return {
      drained,
      applied,
      failed,
      remaining: queue.length,
    };
  },
};
