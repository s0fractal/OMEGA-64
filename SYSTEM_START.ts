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
import { COLDSTART_BOOTSTRAP } from "./COLDSTART_BOOTSTRAP.ts";
import { TELEMETRY_STREAM } from "./TELEMETRY_STREAM.ts";
import { capturePhysiologySnapshot } from "./PHYSIOLOGY_SNAPSHOT.ts";
import {
  DAEMON_INGRESS_POLICY_LIMITS,
  evaluateInvariantAdmission,
  evaluatePlasmidPolicy,
  evaluatePlasmidRisk,
  normalizeDaemonNarrativeContext,
  planInvariantIngress,
  type DaemonAction,
  type DaemonInjectEnvelope,
  type PlasmidRiskProfile,
} from "./DAEMON_INGRESS_POLICY.ts";

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

type DaemonAdmissionSnapshot = {
  tick: number;
  status: "accepted" | "rejected";
  requestedAction: string;
  appliedAction: string;
  degraded: boolean;
  severity: "LOW" | "MID" | "HIGH" | "BLOCKED";
  score: number;
  reason: string;
  sharedCenter: string;
  dominantInvariantVector: string;
  codexLineageLabel?: string;
  codexLineageGuardScore?: number;
  codexLineageGuardReasons?: string[];
};

type RuntimeMetrics = {
  tick: number;
  population: number;
  avgEnergy: number;
  neuralCoherence: number;
  spatialOverflowRatio: number;
  spatialOverflowCount: number;
  spatialMaxCellCount: number;
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

type PressureRingIngressEnvelope = {
  mode: "set" | "step";
  theta?: number;
  delta_theta?: number;
  scale?: number;
  enabled?: boolean;
  reason?: string;
};

type PressureRingUpdateSnapshot = {
  tick: number;
  mode: "set" | "step";
  source: string;
  delta_theta: number;
  theta: number;
  scale: number;
  enabled: boolean;
};

type HomeostasisIngressEnvelope = {
  base_tax?: number;
  target_energy?: number;
  reason?: string;
};

type HomeostasisUpdateSnapshot = {
  tick: number;
  source: string;
  reason: string;
  base_tax_before: number;
  base_tax_after: number;
  target_energy_before: number;
  target_energy_after: number;
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
const COLDSTART_POLICY = RUNTIME_POLICY.coldstart;
const SNAPSHOT_POLICY = RUNTIME_POLICY.snapshot;
const DAEMON_POLICY_WINDOW_MS = DAEMON_POLICY.policyWindowMs;
const DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW = DAEMON_POLICY.maxActionsPerWindow;
const DAEMON_POLICY_MAX_PHEROMONE_INTENSITY = DAEMON_INGRESS_POLICY_LIMITS
  .maxPheromoneIntensity;
const DAEMON_POLICY_MAX_PLASMID_CHARGE = DAEMON_INGRESS_POLICY_LIMITS
  .maxPlasmidCharge;
const DAEMON_SAFE_MIN_POPULATION = DAEMON_INGRESS_POLICY_LIMITS
  .safeMinPopulation;
const DAEMON_SAFE_MIN_AVG_ENERGY = DAEMON_INGRESS_POLICY_LIMITS.safeMinAvgEnergy;
const DAEMON_AUDIT_EFFECT_TICKS = DAEMON_POLICY.auditEffectTicks;
const DAEMON_AUDIT_PATH = DAEMON_POLICY.auditPath;
const DAEMON_INVARIANT_DRIFT_MID_SCORE = DAEMON_INGRESS_POLICY_LIMITS
  .invariantDriftMidScore;
const DAEMON_INVARIANT_DRIFT_HIGH_SCORE = DAEMON_INGRESS_POLICY_LIMITS
  .invariantDriftHighScore;
const DAEMON_ADMISSION_HISTORY_LIMIT = 12;
const DAEMON_PRESSURE_RING_MAX_STEP = Math.PI / 6;
const DAEMON_PRESSURE_RING_HISTORY_LIMIT = 24;
const DAEMON_HOMEOSTASIS_HISTORY_LIMIT = 24;
const DAEMON_HOMEOSTASIS_BASE_TAX_MIN = 0;
const DAEMON_HOMEOSTASIS_BASE_TAX_MAX = 128;
const DAEMON_HOMEOSTASIS_TARGET_MIN = 1;
const DAEMON_HOMEOSTASIS_TARGET_MAX = 10_000;
const DAEMON_DYNAMIC_BUDGET_MIN = Math.max(
  1,
  Math.floor(DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW * 0.25),
);
const DAEMON_DYNAMIC_OVERFLOW_SOFT = 0.18;
const DAEMON_DYNAMIC_OVERFLOW_HARD = 0.35;
const DAEMON_DYNAMIC_ENERGY_SOFT = DAEMON_SAFE_MIN_AVG_ENERGY + 8;
const DAEMON_DYNAMIC_ENERGY_HARD = DAEMON_SAFE_MIN_AVG_ENERGY + 3;
const TELEMETRY_STREAM_EMIT_INTERVAL_TICKS = 2;

let daemonWindowStartMs = Date.now();
let daemonActionsInWindow = 0;
let daemonAuditSeq = 0;
const daemonAuditPending: DaemonAuditPending[] = [];
let latestDaemonAdmission: DaemonAdmissionSnapshot | null = null;
let daemonAdmissionHistory: DaemonAdmissionSnapshot[] = [];
let latestPressureRingUpdate: PressureRingUpdateSnapshot | null = null;
let pressureRingHistory: PressureRingUpdateSnapshot[] = [];
let latestHomeostasisUpdate: HomeostasisUpdateSnapshot | null = null;
let homeostasisHistory: HomeostasisUpdateSnapshot[] = [];
let autoSnapshotLastTick = -1;
let autoSnapshotInFlight = false;
let telemetryStreamLastTick = -1;
let autoSnapshotLastResult: {
  tick: number;
  timestamp: string;
  success: boolean;
  reason: string;
  pruned: number;
  retention: number;
  error?: string;
} | null = null;

const setLatestDaemonAdmission = (
  snapshot: DaemonAdmissionSnapshot,
): void => {
  latestDaemonAdmission = snapshot;
  daemonAdmissionHistory = [snapshot, ...daemonAdmissionHistory].slice(
    0,
    DAEMON_ADMISSION_HISTORY_LIMIT,
  );
};

const setLatestPressureRingUpdate = (
  snapshot: PressureRingUpdateSnapshot,
): void => {
  latestPressureRingUpdate = snapshot;
  pressureRingHistory = [snapshot, ...pressureRingHistory].slice(
    0,
    DAEMON_PRESSURE_RING_HISTORY_LIMIT,
  );
};

const setLatestHomeostasisUpdate = (
  snapshot: HomeostasisUpdateSnapshot,
): void => {
  latestHomeostasisUpdate = snapshot;
  homeostasisHistory = [snapshot, ...homeostasisHistory].slice(
    0,
    DAEMON_HOMEOSTASIS_HISTORY_LIMIT,
  );
};

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
  const spatialHash = PULSE.getSpatialHashState();
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
    spatialOverflowRatio: spatialHash.overflowRatio,
    spatialOverflowCount: spatialHash.overflowCount,
    spatialMaxCellCount: spatialHash.maxCellCount,
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

const resolveDaemonBudgetMax = (metrics: RuntimeMetrics): number => {
  let maxActions = DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW;
  if (metrics.spatialOverflowRatio >= DAEMON_DYNAMIC_OVERFLOW_HARD) {
    maxActions = Math.floor(maxActions * 0.35);
  } else if (metrics.spatialOverflowRatio >= DAEMON_DYNAMIC_OVERFLOW_SOFT) {
    maxActions = Math.floor(maxActions * 0.6);
  }
  if (metrics.avgEnergy <= DAEMON_DYNAMIC_ENERGY_HARD) {
    maxActions = Math.floor(maxActions * 0.5);
  } else if (metrics.avgEnergy <= DAEMON_DYNAMIC_ENERGY_SOFT) {
    maxActions = Math.floor(maxActions * 0.75);
  }
  return clamp(
    Math.floor(maxActions),
    DAEMON_DYNAMIC_BUDGET_MIN,
    DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW,
  );
};

const consumeDaemonBudget = (maxActionsPerWindow: number): {
  ok: boolean;
  remaining: number;
  resetInMs: number;
} => {
  const now = Date.now();
  if (now - daemonWindowStartMs >= DAEMON_POLICY_WINDOW_MS) {
    daemonWindowStartMs = now;
    daemonActionsInWindow = 0;
  }
  const maxActions = clamp(
    Math.floor(maxActionsPerWindow),
    DAEMON_DYNAMIC_BUDGET_MIN,
    DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW,
  );
  if (daemonActionsInWindow >= maxActions) {
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
      maxActions - daemonActionsInWindow,
    ),
    resetInMs: Math.max(
      0,
      DAEMON_POLICY_WINDOW_MS - (now - daemonWindowStartMs),
    ),
  };
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

const maybeAutoSnapshot = async (tick: number): Promise<void> => {
  if (!SNAPSHOT_POLICY.enabled) return;
  if (!Number.isFinite(tick) || tick < 0) return;
  if (autoSnapshotInFlight) return;
  if (
    autoSnapshotLastTick >= 0 &&
    tick - autoSnapshotLastTick < SNAPSHOT_POLICY.intervalTicks
  ) {
    return;
  }

  autoSnapshotInFlight = true;
  const reason = "auto_tick_interval";
  try {
    const result = await SNAPSHOT_ENGINE.exportSnapshot({
      tick,
      reason,
      prune: true,
      retention: SNAPSHOT_POLICY.retention,
    });
    if (result.success) {
      autoSnapshotLastTick = tick;
      autoSnapshotLastResult = {
        tick,
        timestamp: result.timestamp,
        success: true,
        reason,
        pruned: result.pruned ?? 0,
        retention: result.retention ?? SNAPSHOT_POLICY.retention,
      };
      return;
    }
    autoSnapshotLastResult = {
      tick,
      timestamp: "",
      success: false,
      reason,
      pruned: 0,
      retention: SNAPSHOT_POLICY.retention,
      error: result.error ?? "SNAPSHOT_EXPORT_FAILED",
    };
    LOGGER.warn(
      `[SNAPSHOT] Auto snapshot failed tick=${tick} reason=${autoSnapshotLastResult.error}`,
    );
  } catch (err) {
    autoSnapshotLastResult = {
      tick,
      timestamp: "",
      success: false,
      reason,
      pruned: 0,
      retention: SNAPSHOT_POLICY.retention,
      error: String(err),
    };
    LOGGER.warn(
      `[SNAPSHOT] Auto snapshot exception tick=${tick} err=${String(err)}`,
    );
  } finally {
    autoSnapshotInFlight = false;
  }
};

const buildTelemetry = async () => {
  const metrics = collectRuntimeMetrics();
  const active = STATE_MATRIX.getActiveIndices();
  const pressure = PULSE.getEvolutionPressureState();
  const homeostasis = PULSE.getHomeostasisState();
  const dynamicMaxActions = resolveDaemonBudgetMax(metrics);
  const behaviorClusters = SEMANTIC_MEMBRANE.captureBehaviorFrame(
    metrics.tick,
    4096,
  );
  const peerRuleProfiles = P2P_FEDERATION.getPeerRuleProfiles();
  const federationAdmissionState = CONTROL_INTENT_QUEUE
    .getFederationAdmissionState();
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
    pulse_pressure: {
      novelty_signed: pressure.noveltySigned,
      symbiosis_signed: pressure.symbiosisSigned,
      novelty: pressure.novelty,
      fear: pressure.fear,
      symbiosis: pressure.symbiosis,
      ego: pressure.ego,
      ring: {
        enabled: pressure.ring.enabled,
        theta: Number(pressure.ring.theta.toFixed(6)),
        scale: pressure.ring.scale,
        fear_curiosity_balance: Number(
          pressure.ring.fearCuriosityBalance.toFixed(6),
        ),
        ego_love_balance: Number(
          pressure.ring.egoLoveBalance.toFixed(6),
        ),
        novelty_axis_from_ring: pressure.ring.enabled,
        symbiosis_axis_from_ring: pressure.ring.enabled,
      },
    },
    daemon_governance: {
      safe_mode: safeMode.blocked,
      safe_mode_reason: safeMode.reason,
      actions_used_in_window: daemonActionsInWindow,
      actions_max_in_window: DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW,
      actions_dynamic_max_in_window: dynamicMaxActions,
      window_reset_in_ms: resetInMs,
      max_pheromone_intensity: DAEMON_POLICY_MAX_PHEROMONE_INTENSITY,
      max_plasmid_charge: DAEMON_POLICY_MAX_PLASMID_CHARGE,
      invariant_drift_mid_score: DAEMON_INVARIANT_DRIFT_MID_SCORE,
      invariant_drift_high_score: DAEMON_INVARIANT_DRIFT_HIGH_SCORE,
      last_admission: latestDaemonAdmission,
      last_admission_history: daemonAdmissionHistory,
      last_pressure_ring_update: latestPressureRingUpdate,
      last_pressure_ring_history: pressureRingHistory,
      last_homeostasis_update: latestHomeostasisUpdate,
      last_homeostasis_history: homeostasisHistory,
      homeostasis: {
        enabled: homeostasis.enabled,
        target_energy: homeostasis.targetEnergy,
        target_energy_default: homeostasis.targetEnergyDefault,
        target_energy_current: homeostasis.targetEnergyCurrent,
        band: homeostasis.band,
        max_delta: homeostasis.maxDelta,
        overflow_threshold: homeostasis.overflowThreshold,
        starvation_floor: homeostasis.starvationFloor,
        subsidy_enabled: homeostasis.subsidyEnabled,
        base_tax_default: homeostasis.baseTaxDefault,
        base_tax_current: homeostasis.baseTaxCurrent,
        last_update_tick: homeostasis.lastUpdateTick,
        last_update_source: homeostasis.lastUpdateSource,
        last_update_reason: homeostasis.lastUpdateReason,
      },
    },
    snapshot_guard: {
      enabled: SNAPSHOT_POLICY.enabled,
      interval_ticks: SNAPSHOT_POLICY.intervalTicks,
      retention: SNAPSHOT_POLICY.retention,
      in_flight: autoSnapshotInFlight,
      last_tick: autoSnapshotLastTick,
      last_result: autoSnapshotLastResult,
    },
    spatial_hash_guard: {
      tick: metrics.tick,
      overflow_count: metrics.spatialOverflowCount,
      max_cell_count: metrics.spatialMaxCellCount,
      overflow_ratio: metrics.spatialOverflowRatio,
    },
    behavior_clusters: behaviorClusters.slice(0, 6),
    behavior_invariant: SEMANTIC_MEMBRANE.dominantBehaviorInvariant(),
    federation_rule_genome: {
      local: P2P_FEDERATION.localRuleGenome,
      peers: peerRuleProfiles.slice(0, 8),
    },
    federation_admission: {
      latest: federationAdmissionState.latest,
      history: federationAdmissionState.history.slice(0, 8),
      policy: federationAdmissionState.policy,
    },
  };
};

const buildFederateLocalContext = (
  packet: Record<string, unknown>,
  pulseId: number,
): {
  behavior: { invariant: string; dominantRole: number; memberCount: number };
  codex: {
    genome: string;
    label: string;
    dominantEpochs: number;
    peakShare: number;
    known: boolean;
    generatedAt: string;
  };
} => {
  const localBehavior =
    SEMANTIC_MEMBRANE.captureBehaviorFrame(pulseId, 1024)[0];
  const behavior = localBehavior
    ? {
      invariant: localBehavior.behaviorSignature,
      dominantRole: localBehavior.dominantRole,
      memberCount: localBehavior.memberCount,
    }
    : { invariant: "none", dominantRole: -1, memberCount: 0 };
  const localDominantGenome =
    dominantGenomes(STATE_MATRIX.getActiveIndices(), 1)[0];
  const fallbackGenome = typeof packet?.logic === "string"
    ? packet.logic
    : "0000000000000000";
  const codex = AKASHA_CODEX.lookupLineageProfile(
    localDominantGenome ?? fallbackGenome,
  );
  return { behavior, codex };
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

const asOptionalBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const norm = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(norm)) return true;
    if (["0", "false", "no", "off"].includes(norm)) return false;
  }
  return undefined;
};

const parsePressureRingIngressEnvelope = (
  body: unknown,
): PressureRingIngressEnvelope | null => {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const payloadSource = root.payload && typeof root.payload === "object"
    ? root.payload as Record<string, unknown>
    : root;

  const modeRaw = typeof root.mode === "string"
    ? root.mode
    : typeof payloadSource.mode === "string"
    ? payloadSource.mode
    : "step";
  const mode = modeRaw.trim().toLowerCase();
  if (mode !== "set" && mode !== "step") return null;

  const thetaValue = asFiniteNumber(
    payloadSource.theta ?? payloadSource.target_theta,
    Number.NaN,
  );
  const deltaValue = asFiniteNumber(
    payloadSource.delta_theta ?? payloadSource.delta,
    Number.NaN,
  );
  if (mode === "set" && !Number.isFinite(thetaValue)) return null;
  if (mode === "step" && !Number.isFinite(deltaValue)) return null;

  const scaleRaw = asFiniteNumber(payloadSource.scale, Number.NaN);
  const enabled = asOptionalBoolean(payloadSource.enabled);
  const reason = typeof payloadSource.reason === "string"
    ? payloadSource.reason.trim().slice(0, 96)
    : "daemon_phase_scheduler";

  const envelope: PressureRingIngressEnvelope = {
    mode: mode as "set" | "step",
    reason: reason.length > 0 ? reason : "daemon_phase_scheduler",
  };
  if (Number.isFinite(thetaValue)) envelope.theta = thetaValue;
  if (Number.isFinite(deltaValue)) {
    envelope.delta_theta = clamp(
      deltaValue,
      -DAEMON_PRESSURE_RING_MAX_STEP,
      DAEMON_PRESSURE_RING_MAX_STEP,
    );
  }
  if (Number.isFinite(scaleRaw)) {
    envelope.scale = clamp(Math.round(scaleRaw), 0, 2048);
  }
  if (enabled !== undefined) envelope.enabled = enabled;
  return envelope;
};

const parseHomeostasisIngressEnvelope = (
  body: unknown,
): HomeostasisIngressEnvelope | null => {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const payloadSource = root.payload && typeof root.payload === "object"
    ? root.payload as Record<string, unknown>
    : root;
  const baseTax = asFiniteNumber(
    payloadSource.base_tax ?? payloadSource.baseTax,
    Number.NaN,
  );
  const targetEnergy = asFiniteNumber(
    payloadSource.target_energy ?? payloadSource.targetEnergy,
    Number.NaN,
  );
  if (!Number.isFinite(baseTax) && !Number.isFinite(targetEnergy)) return null;
  const reason = typeof payloadSource.reason === "string"
    ? payloadSource.reason.trim().slice(0, 96)
    : "daemon_homeostasis_controller";
  const envelope: HomeostasisIngressEnvelope = {
    reason: reason.length > 0 ? reason : "daemon_homeostasis_controller",
  };
  if (Number.isFinite(baseTax)) {
    envelope.base_tax = clamp(
      Math.round(baseTax),
      DAEMON_HOMEOSTASIS_BASE_TAX_MIN,
      DAEMON_HOMEOSTASIS_BASE_TAX_MAX,
    );
  }
  if (Number.isFinite(targetEnergy)) {
    envelope.target_energy = clamp(
      Math.round(targetEnergy),
      DAEMON_HOMEOSTASIS_TARGET_MIN,
      DAEMON_HOMEOSTASIS_TARGET_MAX,
    );
  }
  return envelope;
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

  if (url.pathname === "/api/telemetry/stream" && req.method === "GET") {
    const limit = clamp(
      Math.floor(asFiniteNumber(url.searchParams.get("limit"), 128)),
      1,
      1024,
    );
    return new Response(
      JSON.stringify({
        ok: true,
        history: TELEMETRY_STREAM.history(limit),
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/telemetry/histogram" && req.method === "GET") {
    const metricRaw = (url.searchParams.get("metric") ?? "").trim();
    if (
      metricRaw !== "population" && metricRaw !== "avgEnergy" &&
      metricRaw !== "neuralCoherence" && metricRaw !== "spatialOverflowRatio"
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "INVALID_METRIC",
          allowed: TELEMETRY_STREAM.metrics(),
        }),
        { status: 400, headers: JSON_HEADERS },
      );
    }
    const windowMs = clamp(
      Math.floor(asFiniteNumber(url.searchParams.get("window_ms"), 60000)),
      1000,
      86_400_000,
    );
    const buckets = clamp(
      Math.floor(asFiniteNumber(url.searchParams.get("buckets"), 12)),
      1,
      64,
    );
    return new Response(
      JSON.stringify({
        ok: true,
        histogram: TELEMETRY_STREAM.histogram(metricRaw, windowMs, buckets),
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/mutation-telemetry" && req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        mutation_telemetry: MUTATION_TELEMETRY.snapshot(),
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/telemetry/ws") {
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "WEBSOCKET_UPGRADE_REQUIRED",
        }),
        { status: 426, headers: JSON_HEADERS },
      );
    }
    const { socket, response } = Deno.upgradeWebSocket(req);
    TELEMETRY_STREAM.attach(socket);
    return response;
  }

  if (url.pathname === "/api/pressure-ring" && req.method === "GET") {
    const pressure = PULSE.getEvolutionPressureState();
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        pressure_ring: {
          novelty_signed: pressure.noveltySigned,
          symbiosis_signed: pressure.symbiosisSigned,
          novelty: pressure.novelty,
          fear: pressure.fear,
          symbiosis: pressure.symbiosis,
          ego: pressure.ego,
          ring: {
            enabled: pressure.ring.enabled,
            theta: Number(pressure.ring.theta.toFixed(6)),
            scale: pressure.ring.scale,
            fear_curiosity_balance: Number(
              pressure.ring.fearCuriosityBalance.toFixed(6),
            ),
            ego_love_balance: Number(pressure.ring.egoLoveBalance.toFixed(6)),
          },
        },
        latest_update: latestPressureRingUpdate,
        history: pressureRingHistory,
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/pressure-ring" && req.method === "POST") {
    const denied = requireDaemonAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const envelope = parsePressureRingIngressEnvelope(body);
      if (!envelope) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_pressure_ring_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_PRESSURE_RING_PAYLOAD",
            expected:
              "Provide {mode:set|step, theta|delta_theta, scale?, enabled?, reason?}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const pressure = PULSE.updateEvolutionPressureRing({
        mode: envelope.mode,
        theta: envelope.theta,
        deltaTheta: envelope.delta_theta,
        scale: envelope.scale,
        enabled: envelope.enabled,
        source: envelope.reason ?? "daemon_phase_scheduler",
      });
      const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
      const snapshot: PressureRingUpdateSnapshot = {
        tick,
        mode: envelope.mode,
        source: envelope.reason ?? "daemon_phase_scheduler",
        delta_theta: envelope.mode === "step" ? (envelope.delta_theta ?? 0) : 0,
        theta: Number(pressure.ring.theta.toFixed(6)),
        scale: pressure.ring.scale,
        enabled: pressure.ring.enabled,
      };
      setLatestPressureRingUpdate(snapshot);
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_pressure_ring_update",
        count: 1,
      });
      await appendDaemonAudit({
        event_type: "DAEMON_PRESSURE_RING",
        tick,
        mode: envelope.mode,
        source: snapshot.source,
        delta_theta: snapshot.delta_theta,
        theta: snapshot.theta,
        scale: snapshot.scale,
        enabled: snapshot.enabled,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          updated: snapshot,
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        },
      );
    } catch (err) {
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_pressure_ring_exception",
        count: 1,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "PRESSURE_RING_UPDATE_EXCEPTION",
          details: String(err),
        }),
        { status: 500, headers: JSON_HEADERS },
      );
    }
  }

  if (url.pathname === "/api/homeostasis" && req.method === "GET") {
    const homeostasis = PULSE.getHomeostasisState();
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        homeostasis: {
          enabled: homeostasis.enabled,
          target_energy: homeostasis.targetEnergy,
          target_energy_default: homeostasis.targetEnergyDefault,
          target_energy_current: homeostasis.targetEnergyCurrent,
          band: homeostasis.band,
          max_delta: homeostasis.maxDelta,
          overflow_threshold: homeostasis.overflowThreshold,
          starvation_floor: homeostasis.starvationFloor,
          subsidy_enabled: homeostasis.subsidyEnabled,
          base_tax_default: homeostasis.baseTaxDefault,
          base_tax_current: homeostasis.baseTaxCurrent,
          last_update_tick: homeostasis.lastUpdateTick,
          last_update_source: homeostasis.lastUpdateSource,
          last_update_reason: homeostasis.lastUpdateReason,
        },
        latest_update: latestHomeostasisUpdate,
        history: homeostasisHistory,
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/physiology" && req.method === "GET") {
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
    const homeostasis = PULSE.getHomeostasisState();
    const pressure = PULSE.getEvolutionPressureState();
    const physiology = capturePhysiologySnapshot({
      tick,
      homeostasis: {
        targetEnergyCurrent: homeostasis.targetEnergyCurrent,
        band: homeostasis.band,
        maxDelta: homeostasis.maxDelta,
        overflowThreshold: homeostasis.overflowThreshold,
        baseTaxCurrent: homeostasis.baseTaxCurrent,
      },
      pressure: {
        novelty: pressure.novelty,
        fear: pressure.fear,
        symbiosis: pressure.symbiosis,
        ego: pressure.ego,
        ring: {
          scale: pressure.ring.scale,
        },
      },
    });
    return new Response(
      JSON.stringify({
        ok: true,
        physiology,
      }),
      { headers: JSON_HEADERS },
    );
  }

  if (url.pathname === "/api/homeostasis" && req.method === "POST") {
    const denied = requireDaemonAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const envelope = parseHomeostasisIngressEnvelope(body);
      if (
        !envelope ||
        (envelope.base_tax === undefined && envelope.target_energy === undefined)
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_homeostasis_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_HOMEOSTASIS_PAYLOAD",
            expected:
              "Provide {base_tax?:number, target_energy?:number, reason?:string}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
      const before = PULSE.getHomeostasisState();
      const updated = PULSE.updateHomeostasisPolicy({
        baseTax: envelope.base_tax,
        targetEnergy: envelope.target_energy,
        source: "daemon_homeostasis_controller",
        reason: envelope.reason ?? "daemon_homeostasis_controller",
        tick,
      });
      const snapshot: HomeostasisUpdateSnapshot = {
        tick,
        source: "daemon_homeostasis_controller",
        reason: envelope.reason ?? "daemon_homeostasis_controller",
        base_tax_before: before.baseTaxCurrent,
        base_tax_after: updated.baseTaxCurrent,
        target_energy_before: before.targetEnergy,
        target_energy_after: updated.targetEnergy,
      };
      setLatestHomeostasisUpdate(snapshot);
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_homeostasis_update",
        count: 1,
      });
      await appendDaemonAudit({
        event_type: "DAEMON_HOMEOSTASIS",
        tick,
        source: snapshot.source,
        reason: snapshot.reason,
        base_tax_before: snapshot.base_tax_before,
        base_tax_after: snapshot.base_tax_after,
        target_energy_before: snapshot.target_energy_before,
        target_energy_after: snapshot.target_energy_after,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          updated: snapshot,
          homeostasis: {
            enabled: updated.enabled,
            target_energy: updated.targetEnergy,
            target_energy_default: updated.targetEnergyDefault,
            target_energy_current: updated.targetEnergyCurrent,
            band: updated.band,
            max_delta: updated.maxDelta,
            overflow_threshold: updated.overflowThreshold,
            starvation_floor: updated.starvationFloor,
            subsidy_enabled: updated.subsidyEnabled,
            base_tax_default: updated.baseTaxDefault,
            base_tax_current: updated.baseTaxCurrent,
            last_update_tick: updated.lastUpdateTick,
            last_update_source: updated.lastUpdateSource,
            last_update_reason: updated.lastUpdateReason,
          },
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        },
      );
    } catch (err) {
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_homeostasis_exception",
        count: 1,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "HOMEOSTASIS_UPDATE_EXCEPTION",
          details: String(err),
        }),
        { status: 500, headers: JSON_HEADERS },
      );
    }
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

  if (url.pathname === "/api/codex/invariants" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "12", 10);
    const invariants = await AKASHA_CODEX.getInvariants(
      Number.isFinite(limit) ? limit : 12,
    );
    return new Response(JSON.stringify(invariants), {
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
        setLatestDaemonAdmission({
          tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
          status: "rejected",
          requestedAction: "UNKNOWN",
          appliedAction: "BLOCKED",
          degraded: false,
          severity: "BLOCKED",
          score: 0,
          reason: "INVALID_INJECT_PAYLOAD",
          sharedCenter: "parse",
          dominantInvariantVector: "none",
        });
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
        setLatestDaemonAdmission({
          tick: baseline.tick,
          status: "accepted",
          requestedAction: "OBSERVE",
          appliedAction: "OBSERVE",
          degraded: false,
          severity: "LOW",
          score: 0,
          reason: "OBSERVE_NOOP",
          sharedCenter: "tick.exists",
          dominantInvariantVector: "none",
        });
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
        setLatestDaemonAdmission({
          tick: baseline.tick,
          status: "rejected",
          requestedAction: envelope.action_type,
          appliedAction: "BLOCKED",
          degraded: false,
          severity: "BLOCKED",
          score: 0,
          reason: safeMode.reason,
          sharedCenter: "safe-mode",
          dominantInvariantVector: "none",
        });
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

      const dynamicBudgetMax = resolveDaemonBudgetMax(baseline);
      const budget = consumeDaemonBudget(dynamicBudgetMax);
      if (!budget.ok) {
        setLatestDaemonAdmission({
          tick: baseline.tick,
          status: "rejected",
          requestedAction: envelope.action_type,
          appliedAction: "BLOCKED",
          degraded: false,
          severity: "BLOCKED",
          score: 0,
          reason: "DAEMON_RATE_LIMIT_WINDOW_EXCEEDED",
          sharedCenter: "budget-window",
          dominantInvariantVector: "none",
        });
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
            dynamic_max_actions: dynamicBudgetMax,
          }),
          { status: 429, headers: JSON_HEADERS },
        );
      }

      let plasmidRisk: PlasmidRiskProfile | null = null;
      if (envelope.action_type === "INJECT_PLASMID") {
        if (!envelope.payload.hex_code) {
          setLatestDaemonAdmission({
            tick: baseline.tick,
            status: "rejected",
            requestedAction: envelope.action_type,
            appliedAction: "BLOCKED",
            degraded: false,
            severity: "BLOCKED",
            score: 0,
            reason: "INVALID_PLASMID_PAYLOAD",
            sharedCenter: "policy",
            dominantInvariantVector: "none",
          });
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
          setLatestDaemonAdmission({
            tick: baseline.tick,
            status: "rejected",
            requestedAction: envelope.action_type,
            appliedAction: "BLOCKED",
            degraded: false,
            severity: "BLOCKED",
            score: 0,
            reason: "DAEMON_POLICY_PLASMID_CHARGE_EXCEEDED",
            sharedCenter: "policy",
            dominantInvariantVector: "none",
          });
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
          setLatestDaemonAdmission({
            tick: baseline.tick,
            status: "rejected",
            requestedAction: envelope.action_type,
            appliedAction: "BLOCKED",
            degraded: false,
            severity: "BLOCKED",
            score: 0,
            reason: plasmidPolicy.reason,
            sharedCenter: "policy",
            dominantInvariantVector: "none",
          });
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
        plasmidRisk = evaluatePlasmidRisk(
          envelope.payload.hex_code,
          envelope.payload.intensity,
        );
      }

      const dominantGenome = dominantGenomes(STATE_MATRIX.getActiveIndices(), 1)
        .at(0) ?? "";
      const narrativeContext = normalizeDaemonNarrativeContext(
        await AKASHA_CODEX.getNarrative(3),
        dominantGenome,
      );
      const ingressPlan = planInvariantIngress(
        envelope,
        evaluateInvariantAdmission(
          envelope,
          baseline,
          narrativeContext,
          plasmidRisk,
        ),
      );
      const applied = ingressPlan.applied;

      if (ingressPlan.degraded) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: ingressPlan.admission.severity === "HIGH"
            ? "daemon_invariant_degrade_high"
            : "daemon_invariant_degrade_mid",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_DEGRADED",
          tick: baseline.tick,
          requested_action: ingressPlan.requested.action_type,
          applied_action: ingressPlan.applied.action_type,
          requested_payload: ingressPlan.requested.payload,
          applied_payload: ingressPlan.applied.payload,
          degrade_reason: ingressPlan.degradeReason,
          admission: ingressPlan.admission,
          plasmid_risk: plasmidRisk,
          metrics: baseline,
          budget,
        });
        AKASHA_CODEX.recordDaemonAdmission(
          baseline.tick,
          ingressPlan.requested.action_type,
          ingressPlan.applied.action_type,
          ingressPlan.admission.severity,
          ingressPlan.admission.score,
          ingressPlan.degradeReason ?? "INVARIANT_DEGRADED",
          ingressPlan.admission.context.sharedCenter,
          ingressPlan.admission.context.dominantInvariantVector,
        );
      }

      if (applied.action_type === "DROP_PHEROMONE") {
        if (
          applied.payload.intensity > DAEMON_POLICY_MAX_PHEROMONE_INTENSITY
        ) {
          setLatestDaemonAdmission({
            tick: baseline.tick,
            status: "rejected",
            requestedAction: envelope.action_type,
            appliedAction: applied.action_type,
            degraded: ingressPlan.degraded,
            severity: "BLOCKED",
            score: ingressPlan.admission.score,
            reason: "DAEMON_POLICY_PHEROMONE_INTENSITY_EXCEEDED",
            sharedCenter: ingressPlan.admission.context.sharedCenter,
            dominantInvariantVector:
              ingressPlan.admission.context.dominantInvariantVector,
            codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
            codexLineageGuardScore:
              ingressPlan.admission.context.codexLineageGuardScore,
            codexLineageGuardReasons:
              ingressPlan.admission.context.codexLineageGuardReasons,
          });
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
          applied.payload.target_x,
          applied.payload.target_y,
          applied.payload.intensity,
          "external_daemon",
        );
        const auditId = `daemon-${baseline.tick}-${++daemonAuditSeq}`;
        if (queued.ok) {
          queueDaemonAudit({
            auditId,
            action: "DROP_PHEROMONE",
            requestedAction: ingressPlan.requested.action_type,
            targetX: applied.payload.target_x,
            targetY: applied.payload.target_y,
            intensity: applied.payload.intensity,
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
          requested_action: ingressPlan.requested.action_type,
          payload: applied.payload,
          queue: queued,
          metrics: baseline,
          budget,
          admission: ingressPlan.admission,
          plasmid_risk: plasmidRisk,
          degraded: ingressPlan.degraded,
          degrade_reason: ingressPlan.degradeReason,
        });
        setLatestDaemonAdmission({
          tick: baseline.tick,
          status: "accepted",
          requestedAction: ingressPlan.requested.action_type,
          appliedAction: "DROP_PHEROMONE",
          degraded: ingressPlan.degraded,
          severity: ingressPlan.admission.severity,
          score: ingressPlan.admission.score,
          reason: ingressPlan.degradeReason ??
            ingressPlan.admission.reasons.join("|"),
          sharedCenter: ingressPlan.admission.context.sharedCenter,
          dominantInvariantVector:
            ingressPlan.admission.context.dominantInvariantVector,
          codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
          codexLineageGuardScore:
            ingressPlan.admission.context.codexLineageGuardScore,
          codexLineageGuardReasons:
            ingressPlan.admission.context.codexLineageGuardReasons,
        });
        return new Response(
          JSON.stringify({
            ...queued,
            admission: ingressPlan.admission,
            plasmid_risk: plasmidRisk,
            degraded: ingressPlan.degraded,
            degrade_reason: ingressPlan.degradeReason,
            applied_action: "DROP_PHEROMONE",
          }),
          {
            status: queued.status,
            headers: JSON_HEADERS,
          },
        );
      }

      if (!applied.payload.hex_code) {
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

      const queued = CONTROL_INTENT_QUEUE.enqueuePlasmid(
        applied.payload.target_x,
        applied.payload.target_y,
        applied.payload.hex_code,
        applied.payload.intensity,
        "external_daemon",
      );
      const auditId = `daemon-${baseline.tick}-${++daemonAuditSeq}`;
      if (queued.ok) {
        queueDaemonAudit({
          auditId,
          action: "INJECT_PLASMID",
          requestedAction: ingressPlan.requested.action_type,
          targetX: applied.payload.target_x,
          targetY: applied.payload.target_y,
          intensity: applied.payload.intensity,
          hexCode: applied.payload.hex_code,
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
        requested_action: ingressPlan.requested.action_type,
        payload: applied.payload,
        queue: queued,
        metrics: baseline,
        budget,
        admission: ingressPlan.admission,
        plasmid_risk: plasmidRisk,
        degraded: ingressPlan.degraded,
        degrade_reason: ingressPlan.degradeReason,
      });
      setLatestDaemonAdmission({
        tick: baseline.tick,
        status: "accepted",
        requestedAction: ingressPlan.requested.action_type,
        appliedAction: "INJECT_PLASMID",
        degraded: ingressPlan.degraded,
        severity: ingressPlan.admission.severity,
        score: ingressPlan.admission.score,
        reason: ingressPlan.degradeReason ??
          ingressPlan.admission.reasons.join("|"),
        sharedCenter: ingressPlan.admission.context.sharedCenter,
        dominantInvariantVector:
          ingressPlan.admission.context.dominantInvariantVector,
        codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
        codexLineageGuardScore:
          ingressPlan.admission.context.codexLineageGuardScore,
        codexLineageGuardReasons:
          ingressPlan.admission.context.codexLineageGuardReasons,
      });
      return new Response(
        JSON.stringify({
          ...queued,
          admission: ingressPlan.admission,
          plasmid_risk: plasmidRisk,
          degraded: ingressPlan.degraded,
          degrade_reason: ingressPlan.degradeReason,
          applied_action: "INJECT_PLASMID",
        }),
        {
          status: queued.status,
          headers: JSON_HEADERS,
        },
      );
    } catch (err) {
      setLatestDaemonAdmission({
        tick: Atomics.load(STATE_MATRIX.tickCounter, 0),
        status: "rejected",
        requestedAction: "UNKNOWN",
        appliedAction: "BLOCKED",
        degraded: false,
        severity: "BLOCKED",
        score: 0,
        reason: "INVALID_INJECT_PAYLOAD",
        sharedCenter: "exception",
        dominantInvariantVector: "none",
      });
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
      const localContext = buildFederateLocalContext(
        packet as Record<string, unknown>,
        PULSE.currentPulseId,
      );
      const queued = CONTROL_INTENT_QUEUE.enqueueFederate(
        packet,
        PULSE.currentPulseId,
        localContext.behavior,
        localContext.codex,
      );
      P2P_FEDERATION.observePeerRuleGenome(
        packet?.sourceNode,
        packet?.ruleGenome,
      );
      const admissionSummary = queued.admission &&
          typeof queued.admission === "object"
        ? ` action=${
          String(
            (queued.admission as Record<string, unknown>).action ?? "accept",
          )
        } score=${
          String((queued.admission as Record<string, unknown>).score ?? 0)
        } codex=${
          String(
            (queued.admission as Record<string, unknown>).localCodexLabel ??
              "unknown-lineage",
          )
        }->${
          String(
            (queued.admission as Record<string, unknown>).peerCodexLabel ??
              "unknown-lineage",
          )
        } fragments=${
          Array.isArray(
              (queued.admission as Record<string, unknown>).policyFragments,
            )
            ? (
              (queued.admission as Record<string, unknown>)
                .policyFragments as unknown[]
            ).length
            : 0
        }`
        : "";
      LOGGER.info(
        `🛸 [FEDERATION] Incoming migration from ${packet.sourceNode}: ${packet.id}${admissionSummary}`,
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

  if (url.pathname === "/peers/profiles") {
    return new Response(
      JSON.stringify({
        local: P2P_FEDERATION.localRuleGenome,
        peers: P2P_FEDERATION.getPeerRuleProfiles(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (url.pathname === "/federate/admission") {
    return new Response(
      JSON.stringify(CONTROL_INTENT_QUEUE.getFederationAdmissionState()),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
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

  if (url.pathname === "/codex/invariants" && req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "16", 10);
    const invariants = await AKASHA_CODEX.getInvariants(
      Number.isFinite(limit) ? limit : 16,
    );
    return new Response(JSON.stringify(invariants), {
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
  const coldstart = COLDSTART_BOOTSTRAP.seed({
    enabled: COLDSTART_POLICY.enabled,
    count: COLDSTART_POLICY.count,
    replicatorRatio: COLDSTART_POLICY.replicatorRatio,
    seed: COLDSTART_POLICY.seed,
    energy: COLDSTART_POLICY.energy,
    resonance: COLDSTART_POLICY.resonance,
  });
  if (coldstart.skipped) {
    LOGGER.info(`🌱 [COLDSTART] ${coldstart.reason}`);
  } else {
    LOGGER.info(
      `🌱 [COLDSTART] seeded=${coldstart.seeded}/${coldstart.configuredCount} replicators=${coldstart.replicators} architects=${coldstart.architects} seed=${coldstart.seed}`,
    );
  }
  await PULSE.initWorkers();

  while (true) {
    await PULSE.tick();
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
    await flushDaemonAuditEffects(tick);
    await maybeAutoSnapshot(tick);
    if (
      telemetryStreamLastTick < 0 ||
      tick - telemetryStreamLastTick >= TELEMETRY_STREAM_EMIT_INTERVAL_TICKS
    ) {
      const metrics = collectRuntimeMetrics();
      const safeMode = isDaemonSafeMode(metrics);
      TELEMETRY_STREAM.emit({
        tick: metrics.tick,
        population: metrics.population,
        avgEnergy: metrics.avgEnergy,
        neuralCoherence: metrics.neuralCoherence,
        spatialOverflowRatio: metrics.spatialOverflowRatio,
        daemonSafeMode: safeMode.blocked,
      });
      telemetryStreamLastTick = tick;
    }
    await new Promise((r) => setTimeout(r, 16));
  }
})();

// 3. Start Cognitive Breathing Loop (Background)
(async () => {
  LOGGER.info("🌬️ [SYSTEM] Breathing Daemon Waiting for first pulse...");
  await new Promise((r) => setTimeout(r, 5000));
  await BREATH.inhale();
})();
