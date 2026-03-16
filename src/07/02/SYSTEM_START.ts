import {
  AKASHA_CODEX,
  AS_WASM_PATH,
  COLDSTART_BOOTSTRAP,
  CONTROL_INTENT_QUEUE,
  GATE,
  GRID_H,
  GRID_W,
  LOGGER,
  Ld,
  Le,
  Li,
  Lw,
  LineageTracker,
  LINEAGE_TRACKER,
  MUTATION_TELEMETRY,
  MX,
  PANOPTICON_SERVER,
  PULSE,
  RUNTIME_POLICY,
  SNAP_ENGINE,
  SNAPSHOT_ENGINE,
  SOVEREIGNTY_ENGINE,
  SOVEREIGN_ORACLE,
  GLYPH_TELEMETRY,
  evaluateGuardianSignalPromotion,
  evaluateArchitectPlasmidPromotion,
  evaluateReplicationPromotion,
  getLogPath,
  getSnapshotPath,
  hydrateLedgerRuntime,
  rollbackLedgerUpdate,
  saveEpoch,
  snapshotLedgerRuntime,
  type GuardianSignalHybridSnapshot,
  type GuardianSignalPromotionSnapshot,
  type ReplicationHybridSnapshot,
  type ReplicationPromotionSnapshot,
  type ArchitectPlasmidHybridSnapshot,
  type ArchitectPlasmidPromotionSnapshot,
  type LedgerPersistenceSummary,
  type LedgerApplyResult,
  type LedgerRollbackResult,
  type LedgerRuntimeState,
  BONDS_OFFSET,
  MAX_ATOMS,
  createGeneticLedgerRuntime,
  createLedgerRuntime,
  applyLedgerUpdate,
  appendLedgerRecordAndMaybeCompact,
  TELEMETRY_STREAM,
  P2P_FEDERATION,
  PREDICTION_MARKET,
  compressMemory,
  decompressMemoryToLattice,
  recordFromApply,
  recordFromRollback,
  SEMANTIC_MEMBRANE,
  capturePhysiologySnapshot,
  DAEMON_INGRESS_POLICY_LIMITS,
  type DaemonAction,
  type DaemonInjectEnvelope,
  evaluateInvariantAdmission,
  evaluatePlasmidPolicy,
  evaluatePlasmidRisk,
  normalizeDaemonNarrativeContext,
  planInvariantIngress,
  type PlasmidRiskProfile,
  snapshotDaemonIngressPolicyLimits,
  syncDaemonIngressMaxPheromoneIntensity,
  syncDaemonIngressMaxPlasmidCharge,
  createSwarmNexus,
  SWARM_NODE,
  P2P_CODEC,
  GRID_CELLS,
  BREATH,
  mutateUniversalConstants,
} from "@g";

// 1. Initial Delegate Setup (Legacy Bridge Removed)

const UI_PORT = RUNTIME_POLICY.system.port;
const HOST = RUNTIME_POLICY.system.host;
const UI_PATH = "./ui/index.html";
const CONTROL_ENABLE = RUNTIME_POLICY.system.controlEnabled;
const CONTROL_TOKEN = RUNTIME_POLICY.system.controlToken;
const AVATAR_INGRESS_ENABLE = RUNTIME_POLICY.system.avatarIngressEnabled;
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
  glyphStatus?: string;
  glyphRegime?: string;
  glyphDominantRole?: string;
  glyphSourceMode?: string;
};

type RuntimeMetrics = {
  tick: number;
  population: number;
  avgEnergy: number;
  neuralCoherence: number;
  spatialOverflowRatio: number;
  spatialOverflowCount: number;
  spatialMaxCellCount: number;
  guardianSignalHybrid: GuardianSignalHybridSnapshot;
  architectPlasmidHybrid: ArchitectPlasmidHybridSnapshot;
  guardianSignalPromotion: GuardianSignalPromotionSnapshot;
  architectPlasmidPromotion: ArchitectPlasmidPromotionSnapshot;
  replicationHybrid: ReplicationHybridSnapshot;
  replicationPromotion: ReplicationPromotionSnapshot;
  glyphTransport: any; // GlyphSnapshot missing?
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
  sharedCenter: string;
  dominantInvariantVector: string;
  codexLineageLabel?: string;
};

type PressureRingIngressEnvelope = {
  mode?: "set" | "step";
  theta?: number;
  delta_theta?: number;
  scale?: number;
  enabled?: boolean;
  rollback_token?: string;
  reason?: string;
};

type PressureRingUpdateSnapshot = {
  tick: number;
  mode: "set" | "step" | "scale_only" | "mixed" | "rollback";
  source: string;
  delta_theta: number;
  theta: number;
  scale: number;
  enabled: boolean;
  ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  scale_rollback_token: string | null;
  scale_before: number;
  scale_after: number;
};

type HomeostasisIngressEnvelope = {
  base_tax?: number;
  target_energy?: number;
  rollback_token?: string;
  reason?: string;
};

type HomeostasisUpdateSnapshot = {
  tick: number;
  source: string;
  reason: string;
  mode: "apply" | "target_only" | "mixed" | "rollback";
  ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  base_tax_ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  target_energy_ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  base_tax_rollback_token: string | null;
  target_energy_rollback_token: string | null;
  base_tax_before: number;
  base_tax_after: number;
  target_energy_before: number;
  target_energy_after: number;
};

type DaemonPolicyIngressEnvelope = {
  max_pheromone_intensity?: number;
  max_plasmid_charge?: number;
  rollback_token?: string;
  reason?: string;
};

type DaemonPolicyUpdateSnapshot = {
  tick: number;
  source: string;
  reason: string;
  mode: "apply" | "rollback";
  policy_key:
    | "daemon.maxPheromoneIntensity"
    | "daemon.maxPlasmidCharge"
    | null;
  ledger_status:
    | "applied"
    | "noop"
    | "rolled_back"
    | "missing"
    | "consumed"
    | "stale"
    | null;
  pheromone_rollback_token: string | null;
  plasmid_rollback_token: string | null;
  max_pheromone_intensity_before: number;
  max_pheromone_intensity_after: number;
  max_plasmid_charge_before: number;
  max_plasmid_charge_after: number;
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
const DAEMON_SAFE_MIN_POPULATION = DAEMON_INGRESS_POLICY_LIMITS
  .safeMinPopulation;
const DAEMON_SAFE_MIN_AVG_ENERGY =
  DAEMON_INGRESS_POLICY_LIMITS.safeMinAvgEnergy;
const DAEMON_AUDIT_EFFECT_TICKS = DAEMON_POLICY.auditEffectTicks;
const DAEMON_AUDIT_PATH = DAEMON_POLICY.auditPath;
const DAEMON_INVARIANT_DRIFT_MID_SCORE = DAEMON_INGRESS_POLICY_LIMITS
  .invariantDriftMidScore;
const DAEMON_INVARIANT_DRIFT_HIGH_SCORE = DAEMON_INGRESS_POLICY_LIMITS
  .invariantDriftHighScore;
const DAEMON_CODEX_LINEAGE_LONGEVITY_EPOCHS = DAEMON_INGRESS_POLICY_LIMITS
  .codexLineageLongevityEpochs;
const DAEMON_CODEX_LINEAGE_PEAK_SHARE = DAEMON_INGRESS_POLICY_LIMITS
  .codexLineagePeakShare;
const CODEX_LINEAGE_GUARD_PLASMID = "CODEX_LINEAGE_GUARD_PLASMID";
const DAEMON_ADMISSION_HISTORY_LIMIT = 12;
const DAEMON_PRESSURE_RING_MAX_STEP = Math.PI / 6;
const DAEMON_PRESSURE_RING_HISTORY_LIMIT = 24;
const DAEMON_HOMEOSTASIS_HISTORY_LIMIT = 24;
const DAEMON_POLICY_HISTORY_LIMIT = 24;
const DAEMON_HOMEOSTASIS_BASE_TAX_MIN = 0;
const DAEMON_HOMEOSTASIS_BASE_TAX_MAX = 128;
const DAEMON_HOMEOSTASIS_TARGET_MIN = 1;
const DAEMON_HOMEOSTASIS_TARGET_MAX = 10_000;
const DAEMON_MAX_PHEROMONE_INTENSITY_MIN = 1;
const DAEMON_MAX_PHEROMONE_INTENSITY_MAX = 4096;
const DAEMON_MAX_PLASMID_CHARGE_MIN = 1;
const DAEMON_MAX_PLASMID_CHARGE_MAX = 4096;
const DAEMON_DYNAMIC_BUDGET_MIN = Math.max(
  1,
  Math.floor(DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW * 0.25),
);
const DAEMON_DYNAMIC_OVERFLOW_SOFT = 0.18;
const DAEMON_DYNAMIC_OVERFLOW_HARD = 0.35;
const DAEMON_DYNAMIC_ENERGY_SOFT = DAEMON_SAFE_MIN_AVG_ENERGY + 8;
const DAEMON_DYNAMIC_ENERGY_HARD = DAEMON_SAFE_MIN_AVG_ENERGY + 3;
const TELEMETRY_STREAM_EMIT_INTERVAL_TICKS = 2;

const currentDaemonMaxPheromoneIntensity = (): number =>
  DAEMON_INGRESS_POLICY_LIMITS.maxPheromoneIntensity;
const currentDaemonMaxPlasmidCharge = (): number =>
  DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge;

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
let latestDaemonPolicyUpdate: DaemonPolicyUpdateSnapshot | null = null;
let daemonPolicyHistory: DaemonPolicyUpdateSnapshot[] = [];
let daemonPheromoneLedgerRuntime: LedgerRuntimeState<"daemon.maxPheromoneIntensity"> = createGeneticLedgerRuntime(
  "daemon.maxPheromoneIntensity",
  DAEMON_POLICY.maxPheromoneIntensity,
  128,
);
let daemonPheromoneLedgerPersistence: LedgerPersistenceSummary = {
  path: getLogPath("daemon.maxPheromoneIntensity"),
  snapshotPath: getSnapshotPath("daemon.maxPheromoneIntensity"),
  exists: false,
  snapshotExists: false,
  recordCount: 0,
  applyCount: 0,
  rollbackCount: 0,
  tailRecordCount: 0,
  tailApplyCount: 0,
  tailRollbackCount: 0,
  snapshotRecordCount: 0,
  snapshotApplyCount: 0,
  snapshotRollbackCount: 0,
  compactionEnabled: true,
  compactionThreshold: 64,
  compactionKeepTail: 16,
  lastCompactedAt: null,
  lastCompactedTick: -1,
  hydrated: false,
  lastHydratedAt: null,
  lastHydrationError: null,
};
let daemonPlasmidLedgerRuntime: LedgerRuntimeState<"daemon.maxPlasmidCharge"> = createGeneticLedgerRuntime(
  "daemon.maxPlasmidCharge",
  DAEMON_POLICY.maxPlasmidCharge,
  128,
);
let daemonPlasmidLedgerPersistence: LedgerPersistenceSummary = {
  path: getLogPath("daemon.maxPlasmidCharge"),
  snapshotPath: getSnapshotPath("daemon.maxPlasmidCharge"),
  exists: false,
  snapshotExists: false,
  recordCount: 0,
  applyCount: 0,
  rollbackCount: 0,
  tailRecordCount: 0,
  tailApplyCount: 0,
  tailRollbackCount: 0,
  snapshotRecordCount: 0,
  snapshotApplyCount: 0,
  snapshotRollbackCount: 0,
  compactionEnabled: true,
  compactionThreshold: 64,
  compactionKeepTail: 16,
  lastCompactedAt: null,
  lastCompactedTick: -1,
  hydrated: false,
  lastHydratedAt: null,
  lastHydrationError: null,
};
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

const setLatestDaemonPolicyUpdate = (
  snapshot: DaemonPolicyUpdateSnapshot,
): void => {
  latestDaemonPolicyUpdate = snapshot;
  daemonPolicyHistory = [snapshot, ...daemonPolicyHistory].slice(
    0,
    DAEMON_POLICY_HISTORY_LIMIT,
  );
};

const logicToHex = (logic: Uint8Array): string =>
  Array.from(logic).map((b) => b.toString(16).padStart(2, "0")).join("")
    .toUpperCase();

const dominantGenomes = (active: number[], limit = 3): string[] => {
  const counts = new Map<string, number>();
  for (const idx of active) {
    const hex = logicToHex(MX.getLogic(idx));
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([hex]) => hex);
};

const collectRuntimeMetrics = (): RuntimeMetrics => {
  const tick = Number(Atomics.load(MX.tickCounter, 0));
  const active = MX.getActiveIndices();
  const spatialHash = PULSE.getSpatialHashState();
  const guardianSignalHybrid = PULSE.getGuardianSignalHybridState();
  const architectPlasmidHybrid = PULSE.getArchitectPlasmidHybridState();
  const replicationHybrid = PULSE.getReplicationHybridState();
  let totalEnergy = 0;
  for (const idx of active) totalEnergy += MX.getEnergy(idx);
  const avgEnergy = active.length > 0 ? totalEnergy / active.length : 0;
  const rawCoherence = (MX.getClusterSync?.() ??
    0) as number;
  return {
    tick,
    population: active.length,
    avgEnergy: Number(avgEnergy.toFixed(3)),
    neuralCoherence: Number(rawCoherence.toFixed(3)),
    spatialOverflowRatio: spatialHash.overflowRatio,
    spatialOverflowCount: spatialHash.overflowCount,
    spatialMaxCellCount: spatialHash.maxCellCount,
    guardianSignalHybrid: guardianSignalHybrid as any,
    architectPlasmidHybrid: architectPlasmidHybrid as any,
    guardianSignalPromotion: evaluateGuardianSignalPromotion(
      guardianSignalHybrid as any,
    ),
    architectPlasmidPromotion: evaluateArchitectPlasmidPromotion(
      architectPlasmidHybrid as any,
    ),
    replicationHybrid,
    replicationPromotion: evaluateReplicationPromotion(
      replicationHybrid as ReplicationHybridSnapshot,
    ),
    glyphTransport: GLYPH_TELEMETRY.snapshot(),
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
      `${JSON.stringify(event)}
`,
      { append: true, create: true },
    );
  } catch (err) {
    Lw(`[DAEMON_AUDIT] append failed: ${String(err)}`);
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
      requested_action: pending.requestedAction,
      target_x: pending.targetX,
      target_y: pending.targetY,
      shared_center: pending.sharedCenter,
      dominant_invariant_vector: pending.dominantInvariantVector,
      codex_lineage_label: pending.codexLineageLabel ?? "none",
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
    const currentDominantGenome =
      dominantGenomes(MX.getActiveIndices(), 1)[0] ?? "";
    AKASHA_CODEX.recordDaemonEffect(
      currentTick,
      pending.auditId,
      pending.requestedAction,
      pending.action,
      pending.sharedCenter,
      pending.dominantInvariantVector,
      pending.baseline.population,
      metrics.population,
      pending.baseline.avgEnergy,
      metrics.avgEnergy,
      pending.baseline.neuralCoherence,
      metrics.neuralCoherence,
      currentDominantGenome,
    );
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
      retention: SNAPSHOT_POLICY.retention ?? 10,
    });
    if (result.success) {
      autoSnapshotLastTick = tick;
      autoSnapshotLastResult = {
        tick,
        timestamp: result.timestamp ?? new Date().toISOString(),
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
    Lw(
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
    Lw(
      `[SNAPSHOT] Auto snapshot exception tick=${tick} err=${String(err)}`,
    );
  } finally {
    autoSnapshotInFlight = false;
  }
};

const buildTelemetry = async () => {
  const metrics = collectRuntimeMetrics();
  const active = MX.getActiveIndices();
  const pressure = PULSE.getEvolutionPressureState();
  const homeostasis = PULSE.getHomeostasisState();
  const geneticLedger = PULSE.getGeneticLedgerState();
  const dynamicMaxActions = resolveDaemonBudgetMax(metrics);
  const behaviorClusters = SEMANTIC_MEMBRANE.captureBehaviorFrame(
    metrics.tick,
    4096,
  );
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
        ledger_scale: geneticLedger.pressureRingScale,
        ledger_scale_persistence: geneticLedger.pressureRingScalePersistence,
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
    guardian_signal_hybrid: metrics.guardianSignalHybrid,
    architect_plasmid_hybrid: metrics.architectPlasmidHybrid,
    replication_hybrid: metrics.replicationHybrid,
    guardian_signal_promotion: metrics.guardianSignalPromotion,
    architect_plasmid_promotion: metrics.architectPlasmidPromotion,
    replication_promotion: metrics.replicationPromotion,
    glyph_transport: metrics.glyphTransport,
    daemon_governance: {
      safe_mode: safeMode.blocked,
      safe_mode_reason: safeMode.reason,
      actions_used_in_window: daemonActionsInWindow,
      actions_max_in_window: DAEMON_POLICY_MAX_ACTIONS_PER_WINDOW,
      actions_dynamic_max_in_window: dynamicMaxActions,
      window_reset_in_ms: resetInMs,
      max_pheromone_intensity: currentDaemonMaxPheromoneIntensity(),
      max_plasmid_charge: currentDaemonMaxPlasmidCharge(),
      ledger_max_pheromone_intensity: snapshotLedgerRuntime(
        daemonPheromoneLedgerRuntime,
      ),
      ledger_max_pheromone_intensity_persistence:
        daemonPheromoneLedgerPersistence,
      ledger_max_plasmid_charge: snapshotLedgerRuntime(
        daemonPlasmidLedgerRuntime,
      ),
      ledger_max_plasmid_charge_persistence: daemonPlasmidLedgerPersistence,
      invariant_drift_mid_score: DAEMON_INVARIANT_DRIFT_MID_SCORE,
      invariant_drift_high_score: DAEMON_INVARIANT_DRIFT_HIGH_SCORE,
      last_admission: latestDaemonAdmission,
      last_admission_history: daemonAdmissionHistory,
      last_policy_update: latestDaemonPolicyUpdate,
      last_policy_history: daemonPolicyHistory,
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
        ledger_base_tax: geneticLedger.homeostasisBaseTax,
        ledger_base_tax_persistence:
          geneticLedger.homeostasisBaseTaxPersistence,
        ledger_target_energy: geneticLedger.homeostasisTargetEnergy,
        ledger_target_energy_persistence:
          geneticLedger.homeostasisTargetEnergyPersistence,
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
      local: {}, // Swarm disabled
      peers: [], // Swarm disabled
    },
    federation_admission: {
      latest: federationAdmissionState.latest,
      history: federationAdmissionState.history.slice(0, 8),
      policy: federationAdmissionState.policy,
    },
    hormones: [
      MX.get_hormone(0),
      MX.get_hormone(1),
      MX.get_hormone(2),
      MX.get_hormone(3),
      MX.get_hormone(4),
      MX.get_hormone(5),
    ],
    glyph_buffer: GLYPH_TELEMETRY.snapshot(),
  };
};

const _buildFederateLocalContext = (
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
    dominantGenomes(MX.getActiveIndices(), 1)[0];
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
  const rollbackToken = typeof (
      payloadSource.rollback_token ?? payloadSource.rollbackToken
    ) === "string"
    ? String(payloadSource.rollback_token ?? payloadSource.rollbackToken).trim()
    : "";

  const modeRaw = typeof root.mode === "string"
    ? root.mode
    : typeof payloadSource.mode === "string"
    ? payloadSource.mode
    : "";
  const mode = modeRaw.trim().toLowerCase();
  if (rollbackToken.length === 0 && mode !== "set" && mode !== "step") {
    return null;
  }

  const thetaValue = asFiniteNumber(
    payloadSource.theta ?? payloadSource.target_theta,
    Number.NaN,
  );
  const deltaValue = asFiniteNumber(
    payloadSource.delta_theta ?? payloadSource.delta,
    Number.NaN,
  );
  const scaleRaw = asFiniteNumber(payloadSource.scale, Number.NaN);
  const enabled = asOptionalBoolean(payloadSource.enabled);
  if (
    rollbackToken.length === 0 &&
    mode === "set" &&
    !Number.isFinite(thetaValue)
  ) return null;
  if (
    rollbackToken.length === 0 &&
    mode === "step" &&
    !Number.isFinite(deltaValue)
  ) return null;
  if (
    rollbackToken.length === 0 &&
    !Number.isFinite(thetaValue) &&
    !Number.isFinite(deltaValue) &&
    !Number.isFinite(scaleRaw) &&
    enabled === undefined
  ) {
    return null;
  }
  const reason = typeof payloadSource.reason === "string"
    ? payloadSource.reason.trim().slice(0, 96)
    : "daemon_phase_scheduler";

  const envelope: PressureRingIngressEnvelope = {
    reason: reason.length > 0 ? reason : "daemon_phase_scheduler",
  };
  if (mode === "set" || mode === "step") {
    envelope.mode = mode as "set" | "step";
  }
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
  if (rollbackToken.length > 0) {
    envelope.rollback_token = rollbackToken.slice(0, 160);
  }
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
  const rollbackToken = typeof (
      payloadSource.rollback_token ?? payloadSource.rollbackToken
    ) === "string"
    ? String(payloadSource.rollback_token ?? payloadSource.rollbackToken).trim()
    : "";
  if (
    !Number.isFinite(baseTax) &&
    !Number.isFinite(targetEnergy) &&
    rollbackToken.length === 0
  ) {
    return null;
  }
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
  if (rollbackToken.length > 0) {
    envelope.rollback_token = rollbackToken.slice(0, 160);
  }
  return envelope;
};

const parseDaemonPolicyIngressEnvelope = (
  body: unknown,
): DaemonPolicyIngressEnvelope | null => {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const payloadSource = root.payload && typeof root.payload === "object"
    ? root.payload as Record<string, unknown>
    : root;
  const maxPheromoneIntensity = asFiniteNumber(
    payloadSource.max_pheromone_intensity ??
      payloadSource.maxPheromoneIntensity,
    Number.NaN,
  );
  const maxPlasmidCharge = asFiniteNumber(
    payloadSource.max_plasmid_charge ??
      payloadSource.maxPlasmidCharge,
    Number.NaN,
  );
  const rollbackToken = typeof (
      payloadSource.rollback_token ?? payloadSource.rollbackToken
    ) === "string"
    ? String(payloadSource.rollback_token ?? payloadSource.rollbackToken).trim()
    : "";
  if (
    !Number.isFinite(maxPheromoneIntensity) &&
    !Number.isFinite(maxPlasmidCharge) &&
    rollbackToken.length === 0
  ) {
    return null;
  }
  const reason = typeof payloadSource.reason === "string"
    ? payloadSource.reason.trim().slice(0, 96)
    : "daemon_policy_controller";
  const envelope: DaemonPolicyIngressEnvelope = {
    reason: reason.length > 0 ? reason : "daemon_policy_controller",
  };
  if (Number.isFinite(maxPheromoneIntensity)) {
    envelope.max_pheromone_intensity = clamp(
      Math.round(maxPheromoneIntensity),
      DAEMON_MAX_PHEROMONE_INTENSITY_MIN,
      DAEMON_MAX_PHEROMONE_INTENSITY_MAX,
    );
  }
  if (Number.isFinite(maxPlasmidCharge)) {
    envelope.max_plasmid_charge = clamp(
      Math.round(maxPlasmidCharge),
      DAEMON_MAX_PLASMID_CHARGE_MIN,
      DAEMON_MAX_PLASMID_CHARGE_MAX,
    );
  }
  if (rollbackToken.length > 0) {
    envelope.rollback_token = rollbackToken.slice(0, 160);
  }
  return envelope;
};

const inferHomeostasisRollbackKey = (
  rollbackToken: string,
): "pulse.homeostasis.baseTax" | "pulse.homeostasis.targetEnergy" | null => {
  if (rollbackToken.startsWith("pulse.homeostasis.baseTax@")) {
    return "pulse.homeostasis.baseTax";
  }
  if (rollbackToken.startsWith("pulse.homeostasis.targetEnergy@")) {
    return "pulse.homeostasis.targetEnergy";
  }
  return null;
};

const inferDaemonPolicyRollbackKey = (
  rollbackToken: string,
): "daemon.maxPheromoneIntensity" | "daemon.maxPlasmidCharge" | null => {
  if (rollbackToken.startsWith("daemon.maxPheromoneIntensity@")) {
    return "daemon.maxPheromoneIntensity";
  }
  if (rollbackToken.startsWith("daemon.maxPlasmidCharge@")) {
    return "daemon.maxPlasmidCharge";
  }
  return null;
};

const applyDaemonPheromonePolicyLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): LedgerApplyResult<
  "daemon.maxPheromoneIntensity"
> => {
  const result = applyLedgerUpdate(daemonPheromoneLedgerRuntime, update);
  daemonPheromoneLedgerRuntime = result.state;
  syncDaemonIngressMaxPheromoneIntensity(result.state.currentValue);
  return result;
};

const rollbackDaemonPheromonePolicyLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): LedgerRollbackResult<
  "daemon.maxPheromoneIntensity"
> => {
  const result = rollbackLedgerUpdate(daemonPheromoneLedgerRuntime, rollback);
  daemonPheromoneLedgerRuntime = result.state;
  syncDaemonIngressMaxPheromoneIntensity(result.state.currentValue);
  return result;
};

const syncDaemonPheromonePolicyLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime("daemon.maxPheromoneIntensity", {
    initialValue: DAEMON_POLICY.maxPheromoneIntensity,
    historyLimit: daemonPheromoneLedgerRuntime.historyLimit,
  });
  daemonPheromoneLedgerRuntime = hydrated.state;
  daemonPheromoneLedgerPersistence = hydrated.persistence;
  syncDaemonIngressMaxPheromoneIntensity(hydrated.state.currentValue);
};

const applyDaemonPlasmidPolicyLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): LedgerApplyResult<
  "daemon.maxPlasmidCharge"
> => {
  const result = applyLedgerUpdate(daemonPlasmidLedgerRuntime, update);
  daemonPlasmidLedgerRuntime = result.state;
  syncDaemonIngressMaxPlasmidCharge(result.state.currentValue);
  return result;
};

const rollbackDaemonPlasmidPolicyLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): LedgerRollbackResult<
  "daemon.maxPlasmidCharge"
> => {
  const result = rollbackLedgerUpdate(daemonPlasmidLedgerRuntime, rollback);
  daemonPlasmidLedgerRuntime = result.state;
  syncDaemonIngressMaxPlasmidCharge(result.state.currentValue);
  return result;
};

const syncDaemonPlasmidPolicyLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime("daemon.maxPlasmidCharge", {
    initialValue: DAEMON_POLICY.maxPlasmidCharge,
    historyLimit: daemonPlasmidLedgerRuntime.historyLimit,
  });
  daemonPlasmidLedgerRuntime = hydrated.state;
  daemonPlasmidLedgerPersistence = hydrated.persistence;
  syncDaemonIngressMaxPlasmidCharge(hydrated.state.currentValue);
};

const serializeDaemonPolicyState = () => {
  const liveLimits = snapshotDaemonIngressPolicyLimits();
  return {
    max_pheromone_intensity: currentDaemonMaxPheromoneIntensity(),
    max_pheromone_intensity_default: daemonPheromoneLedgerRuntime.defaultValue,
    max_pheromone_intensity_current: daemonPheromoneLedgerRuntime.currentValue,
    max_plasmid_charge: currentDaemonMaxPlasmidCharge(),
    max_plasmid_charge_default: daemonPlasmidLedgerRuntime.defaultValue,
    max_plasmid_charge_current: daemonPlasmidLedgerRuntime.currentValue,
    safe_min_population: liveLimits.safeMinPopulation,
    safe_min_avg_energy: liveLimits.safeMinAvgEnergy,
    ledger_max_pheromone_intensity: snapshotLedgerRuntime(
      daemonPheromoneLedgerRuntime,
    ),
    ledger_max_pheromone_intensity_persistence:
      daemonPheromoneLedgerPersistence,
    ledger_max_plasmid_charge: snapshotLedgerRuntime(
      daemonPlasmidLedgerRuntime,
    ),
    ledger_max_plasmid_charge_persistence: daemonPlasmidLedgerPersistence,
  };
};

const collapseHomeostasisLedgerStatus = (
  baseStatus: HomeostasisUpdateSnapshot["base_tax_ledger_status"],
  targetStatus: HomeostasisUpdateSnapshot["target_energy_ledger_status"],
): HomeostasisUpdateSnapshot["ledger_status"] => {
  if (baseStatus !== null && targetStatus === null) return baseStatus;
  if (baseStatus === null && targetStatus !== null) return targetStatus;
  if (
    baseStatus !== null && targetStatus !== null && baseStatus === targetStatus
  ) {
    return baseStatus;
  }
  return null;
};

Li("🛡️ OMEGA-64 | UNIFIED START | ERA 13: ALEPH");
RUNTIME_POLICY.logFingerprintOnce("system-start");
Li(
  `🌐 [SYSTEM] Observer host=${HOST}:${UI_PORT} controlEnabled=${CONTROL_ENABLE} avatarIngress=${AVATAR_INGRESS_ENABLE} tokenRequired=${
    CONTROL_TOKEN.length > 0
  }`,
);
if (RUNTIME_POLICY.p2p.mainnetEnabled) {
  Li(`🌐 [SYSTEM] MAINNET BOOTSTRAP ACTIVE`);
}
await AKASHA_CODEX.start();

// STAGE 5.3 VERIFICATION: Forced Reflection Seed
setInterval(() => {
  const signalGrid = new Int32Array(
    MX.buffer,
    35200000 + 4096,
    GRID_CELLS,
  );
  const memoryGrid = new Int32Array(
    MX.buffer,
    36100000 + 4096,
    GRID_CELLS,
  );
  // Seed a strong signal in the center
  const center = 40 * GRID_W + 70;
  Atomics.store(signalGrid, center, 1000);
  Atomics.store(memoryGrid, center, 500);
}, 100);

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
    const buffer = MX.buffer;

    const bufferCopy = new Uint8Array(buffer.byteLength);
    bufferCopy.set(new Uint8Array(buffer));
    return new Response(bufferCopy, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  }

  if (url.pathname === "/grid") {
    const attention = MX.attentionField;
    const env = new Int32Array(
      attention.buffer,
      attention.byteOffset,
      attention.byteLength / 4,
    );

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
        tick: Number(Atomics.load(MX.tickCounter, 0)),
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
    const geneticLedger = PULSE.getGeneticLedgerState();
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Number(Atomics.load(MX.tickCounter, 0)),
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
            ledger_scale: geneticLedger.pressureRingScale,
            ledger_scale_persistence:
              geneticLedger.pressureRingScalePersistence,
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
              "Provide {mode?:set|step, theta|delta_theta, scale?, enabled?, rollback_token?, reason?}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const tick = Number(Atomics.load(MX.tickCounter, 0));
      const before = PULSE.getEvolutionPressureState();
      const source = envelope.reason ?? "daemon_phase_scheduler";

      if (
        envelope.rollback_token !== undefined &&
        (
          envelope.mode !== undefined ||
          envelope.theta !== undefined ||
          envelope.delta_theta !== undefined ||
          envelope.scale !== undefined ||
          envelope.enabled !== undefined
        )
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_pressure_ring_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "ROLLBACK_TOKEN_MUST_NOT_BE_MIXED",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (envelope.rollback_token !== undefined) {
        const rollback = await PULSE.rollbackGeneticLedgerUpdate({
          key: "pulse.pressureRing.scale",
          rollbackToken: envelope.rollback_token,
          source,
          reason: source,
          tick,
        });
        const pressure = PULSE.getEvolutionPressureState();
        const geneticLedger = PULSE.getGeneticLedgerState();
        if (rollback.status !== "rolled_back") {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_pressure_ring_rollback_reject",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "PRESSURE_RING_ROLLBACK_REJECTED",
              ledger_status: rollback.status,
              rollback_token: envelope.rollback_token,
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
                  ego_love_balance: Number(
                    pressure.ring.egoLoveBalance.toFixed(6),
                  ),
                  ledger_scale: geneticLedger.pressureRingScale,
                  ledger_scale_persistence:
                    geneticLedger.pressureRingScalePersistence,
                },
              },
            }),
            { status: 409, headers: JSON_HEADERS },
          );
        }

        const snapshot: PressureRingUpdateSnapshot = {
          tick,
          mode: "rollback",
          source,
          delta_theta: 0,
          theta: Number(pressure.ring.theta.toFixed(6)),
          scale: pressure.ring.scale,
          enabled: pressure.ring.enabled,
          ledger_status: rollback.status,
          scale_rollback_token: envelope.rollback_token,
          scale_before: before.ring.scale,
          scale_after: pressure.ring.scale,
        };
        setLatestPressureRingUpdate(snapshot);
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_pressure_ring_rollback",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_PRESSURE_RING_ROLLBACK",
          tick,
          mode: snapshot.mode,
          source: snapshot.source,
          delta_theta: snapshot.delta_theta,
          theta: snapshot.theta,
          scale: snapshot.scale,
          enabled: snapshot.enabled,
          ledger_status: snapshot.ledger_status,
          rollback_token: snapshot.scale_rollback_token,
          scale_before: snapshot.scale_before,
          scale_after: snapshot.scale_after,
        });
        return new Response(
          JSON.stringify({
            ok: true,
            updated: snapshot,
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
                ego_love_balance: Number(
                  pressure.ring.egoLoveBalance.toFixed(6),
                ),
                ledger_scale: geneticLedger.pressureRingScale,
                ledger_scale_persistence:
                  geneticLedger.pressureRingScalePersistence,
              },
            },
          }),
          {
            status: 200,
            headers: JSON_HEADERS,
          },
        );
      }

      const ledgerUpdate = envelope.scale === undefined
        ? null
        : await PULSE.applyGeneticLedgerUpdate({
          key: "pulse.pressureRing.scale",
          value: envelope.scale,
          source,
          reason: source,
          tick,
        });
      const pressure = envelope.mode === undefined
        ? PULSE.getEvolutionPressureState()
        : PULSE.updateEvolutionPressureRing({
          mode: envelope.mode,
          theta: envelope.theta,
          deltaTheta: envelope.delta_theta,
          enabled: envelope.enabled,
          source,
        });
      const geneticLedger = PULSE.getGeneticLedgerState();
      const snapshot: PressureRingUpdateSnapshot = {
        tick,
        mode: envelope.scale !== undefined && envelope.mode !== undefined
          ? "mixed"
          : envelope.scale !== undefined
          ? "scale_only"
          : envelope.mode ?? "set",
        source,
        delta_theta: envelope.mode === "step" ? (envelope.delta_theta ?? 0) : 0,
        theta: Number(pressure.ring.theta.toFixed(6)),
        scale: pressure.ring.scale,
        enabled: pressure.ring.enabled,
        ledger_status: ledgerUpdate?.status ?? null,
        scale_rollback_token: ledgerUpdate?.mutation?.rollbackToken ?? null,
        scale_before: before.ring.scale,
        scale_after: pressure.ring.scale,
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
        mode: snapshot.mode,
        source: snapshot.source,
        delta_theta: snapshot.delta_theta,
        theta: snapshot.theta,
        scale: snapshot.scale,
        enabled: snapshot.enabled,
        ledger_status: snapshot.ledger_status,
        rollback_token: snapshot.scale_rollback_token,
        scale_before: snapshot.scale_before,
        scale_after: snapshot.scale_after,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          updated: snapshot,
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
              ego_love_balance: Number(
                pressure.ring.egoLoveBalance.toFixed(6),
              ),
              ledger_scale: geneticLedger.pressureRingScale,
              ledger_scale_persistence:
                geneticLedger.pressureRingScalePersistence,
            },
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
    const geneticLedger = PULSE.getGeneticLedgerState();
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Number(Atomics.load(MX.tickCounter, 0)),
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
          ledger_base_tax: geneticLedger.homeostasisBaseTax,
          ledger_base_tax_persistence:
            geneticLedger.homeostasisBaseTaxPersistence,
          ledger_target_energy: geneticLedger.homeostasisTargetEnergy,
          ledger_target_energy_persistence:
            geneticLedger.homeostasisTargetEnergyPersistence,
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
    const tick = Number(Atomics.load(MX.tickCounter, 0));
    const hormones = PULSE.getPhysiologicalLedgerState();
    const generic = PULSE.getGenericLedgerSnapshots();
    const geneticLedger = PULSE.getGeneticLedgerState();

    const ledger = {
      ...generic,
      "daemon.maxPheromoneIntensity": snapshotLedgerRuntime(
        daemonPheromoneLedgerRuntime,
      ),
      "daemon.maxPlasmidCharge": snapshotLedgerRuntime(
        daemonPlasmidLedgerRuntime,
      ),
    };

    const physiology = capturePhysiologySnapshot({
      tick,
      hormones,
      ledger,
    });
    const guardianSignalHybrid = PULSE.getGuardianSignalHybridState();
    const architectPlasmidHybrid = PULSE.getArchitectPlasmidHybridState();
    return new Response(
      JSON.stringify({
        ok: true,
        physiology,
        guardian_signal_hybrid: guardianSignalHybrid,
        architect_plasmid_hybrid: architectPlasmidHybrid,
        guardian_signal_promotion: evaluateGuardianSignalPromotion(
          guardianSignalHybrid,
        ),
        glyph_transport: GLYPH_TELEMETRY.snapshot(),
        ledger_base_tax: geneticLedger.homeostasisBaseTax,
        ledger_base_tax_persistence:
          geneticLedger.homeostasisBaseTaxPersistence,
        ledger_target_energy: geneticLedger.homeostasisTargetEnergy,
        ledger_target_energy_persistence:
          geneticLedger.homeostasisTargetEnergyPersistence,
        ledger_pressure_ring_scale: geneticLedger.pressureRingScale,
        ledger_pressure_ring_scale_persistence:
          geneticLedger.pressureRingScalePersistence,
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
        (
          envelope.base_tax === undefined &&
          envelope.target_energy === undefined &&
          envelope.rollback_token === undefined
        )
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
              "Provide {base_tax?:number, target_energy?:number, rollback_token?:string, reason?:string}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (
        envelope.rollback_token !== undefined &&
        (envelope.base_tax !== undefined ||
          envelope.target_energy !== undefined)
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_homeostasis_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "ROLLBACK_TOKEN_MUST_NOT_BE_MIXED",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const tick = Number(Atomics.load(MX.tickCounter, 0));
      const before = PULSE.getHomeostasisState();
      const source = "daemon_homeostasis_controller";
      const reason = envelope.reason ?? "daemon_homeostasis_controller";
      const serializeHomeostasis = (
        updated: ReturnType<typeof PULSE.getHomeostasisState>,
        geneticLedger: ReturnType<typeof PULSE.getGeneticLedgerState>,
      ) => ({
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
        ledger_base_tax: geneticLedger.homeostasisBaseTax,
        ledger_base_tax_persistence:
          geneticLedger.homeostasisBaseTaxPersistence,
        ledger_target_energy: geneticLedger.homeostasisTargetEnergy,
        ledger_target_energy_persistence:
          geneticLedger.homeostasisTargetEnergyPersistence,
      });

      if (envelope.rollback_token !== undefined) {
        const rollbackKey = inferHomeostasisRollbackKey(
          envelope.rollback_token,
        );
        if (rollbackKey === null) {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_homeostasis_invalid_payload",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "UNKNOWN_HOMEOSTASIS_ROLLBACK_TOKEN",
              rollback_token: envelope.rollback_token,
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }

        const rollback = await PULSE.rollbackGeneticLedgerUpdate({
          key: rollbackKey,
          rollbackToken: envelope.rollback_token,
          source,
          reason,
          tick,
        });
        const updated = PULSE.getHomeostasisState();
        const geneticLedger = PULSE.getGeneticLedgerState();
        const baseTaxLedgerStatus = rollbackKey === "pulse.homeostasis.baseTax"
          ? rollback.status
          : null;
        const targetEnergyLedgerStatus =
          rollbackKey === "pulse.homeostasis.targetEnergy"
            ? rollback.status
            : null;
        const ledgerStatus = collapseHomeostasisLedgerStatus(
          baseTaxLedgerStatus,
          targetEnergyLedgerStatus,
        );
        if (rollback.status !== "rolled_back") {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_homeostasis_rollback_reject",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "HOMEOSTASIS_ROLLBACK_REJECTED",
              ledger_status: ledgerStatus,
              base_tax_ledger_status: baseTaxLedgerStatus,
              target_energy_ledger_status: targetEnergyLedgerStatus,
              rollback_token: envelope.rollback_token,
              rollback_key: rollbackKey,
              homeostasis: serializeHomeostasis(updated, geneticLedger),
            }),
            { status: 409, headers: JSON_HEADERS },
          );
        }

        const snapshot: HomeostasisUpdateSnapshot = {
          tick,
          source,
          reason,
          mode: "rollback",
          ledger_status: ledgerStatus,
          base_tax_ledger_status: baseTaxLedgerStatus,
          target_energy_ledger_status: targetEnergyLedgerStatus,
          base_tax_rollback_token: rollbackKey === "pulse.homeostasis.baseTax"
            ? envelope.rollback_token
            : null,
          target_energy_rollback_token:
            rollbackKey === "pulse.homeostasis.targetEnergy"
              ? envelope.rollback_token
              : null,
          base_tax_before: before.baseTaxCurrent,
          base_tax_after: updated.baseTaxCurrent,
          target_energy_before: before.targetEnergy,
          target_energy_after: updated.targetEnergy,
        };
        setLatestHomeostasisUpdate(snapshot);
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_homeostasis_rollback",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_HOMEOSTASIS_ROLLBACK",
          tick,
          source: snapshot.source,
          reason: snapshot.reason,
          mode: snapshot.mode,
          ledger_status: snapshot.ledger_status,
          base_tax_ledger_status: snapshot.base_tax_ledger_status,
          target_energy_ledger_status: snapshot.target_energy_ledger_status,
          rollback_key: rollbackKey,
          rollback_token: envelope.rollback_token,
          base_tax_rollback_token: snapshot.base_tax_rollback_token,
          target_energy_rollback_token: snapshot.target_energy_rollback_token,
          base_tax_before: snapshot.base_tax_before,
          base_tax_after: snapshot.base_tax_after,
          target_energy_before: snapshot.target_energy_before,
          target_energy_after: snapshot.target_energy_after,
        });

        return new Response(
          JSON.stringify({
            ok: true,
            updated: snapshot,
            homeostasis: serializeHomeostasis(updated, geneticLedger),
          }),
          {
            status: 200,
            headers: JSON_HEADERS,
          },
        );
      }

      const baseTaxLedgerUpdate = envelope.base_tax === undefined
        ? null
        : await PULSE.applyGeneticLedgerUpdate({
          key: "pulse.homeostasis.baseTax",
          value: envelope.base_tax,
          source,
          reason,
          tick,
        });
      const targetEnergyLedgerUpdate = envelope.target_energy === undefined
        ? null
        : await PULSE.applyGeneticLedgerUpdate({
          key: "pulse.homeostasis.targetEnergy",
          value: envelope.target_energy,
          source,
          reason,
          tick,
        });
      const updated = PULSE.getHomeostasisState();
      const geneticLedger = PULSE.getGeneticLedgerState();
      const baseTaxLedgerStatus = baseTaxLedgerUpdate?.status ?? null;
      const targetEnergyLedgerStatus = targetEnergyLedgerUpdate?.status ?? null;
      const snapshot: HomeostasisUpdateSnapshot = {
        tick,
        source,
        reason,
        mode: envelope.base_tax !== undefined &&
            envelope.target_energy !== undefined
          ? "mixed"
          : envelope.base_tax !== undefined
          ? "apply"
          : "target_only",
        ledger_status: collapseHomeostasisLedgerStatus(
          baseTaxLedgerStatus,
          targetEnergyLedgerStatus,
        ),
        base_tax_ledger_status: baseTaxLedgerStatus,
        target_energy_ledger_status: targetEnergyLedgerStatus,
        base_tax_rollback_token: baseTaxLedgerUpdate?.mutation?.rollbackToken ??
          null,
        target_energy_rollback_token:
          targetEnergyLedgerUpdate?.mutation?.rollbackToken ?? null,
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
        mode: snapshot.mode,
        ledger_status: snapshot.ledger_status,
        base_tax_ledger_status: snapshot.base_tax_ledger_status,
        target_energy_ledger_status: snapshot.target_energy_ledger_status,
        rollback_token: snapshot.base_tax_rollback_token ??
          snapshot.target_energy_rollback_token,
        base_tax_rollback_token: snapshot.base_tax_rollback_token,
        target_energy_rollback_token: snapshot.target_energy_rollback_token,
        base_tax_before: snapshot.base_tax_before,
        base_tax_after: snapshot.base_tax_after,
        target_energy_before: snapshot.target_energy_before,
        target_energy_after: snapshot.target_energy_after,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          updated: snapshot,
          homeostasis: serializeHomeostasis(updated, geneticLedger),
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

  if (url.pathname === "/api/daemon-policy" && req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        tick: Number(Atomics.load(MX.tickCounter, 0)),
        daemon_policy: serializeDaemonPolicyState(),
        latest_update: latestDaemonPolicyUpdate,
        history: daemonPolicyHistory,
      }),
      {
        headers: JSON_HEADERS,
      },
    );
  }

  if (url.pathname === "/api/daemon-policy" && req.method === "POST") {
    const denied = requireDaemonAuth(req);
    if (denied) return denied;
    try {
      const body = await req.json();
      const envelope = parseDaemonPolicyIngressEnvelope(body);
      if (
        !envelope ||
        (
          envelope.max_pheromone_intensity === undefined &&
          envelope.max_plasmid_charge === undefined &&
          envelope.rollback_token === undefined
        )
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "INVALID_DAEMON_POLICY_PAYLOAD",
            expected:
              "Provide {max_pheromone_intensity?:number, max_plasmid_charge?:number, rollback_token?:string, reason?:string}",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (
        envelope.rollback_token !== undefined &&
        (
          envelope.max_pheromone_intensity !== undefined ||
          envelope.max_plasmid_charge !== undefined
        )
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "ROLLBACK_TOKEN_MUST_NOT_BE_MIXED",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      if (
        envelope.max_pheromone_intensity !== undefined &&
        envelope.max_plasmid_charge !== undefined
      ) {
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_invalid_payload",
          count: 1,
        });
        return new Response(
          JSON.stringify({
            ok: false,
            reason: "MULTIPLE_DAEMON_POLICY_FIELDS_NOT_ALLOWED",
          }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const tick = Number(Atomics.load(MX.tickCounter, 0));
      const source = "daemon_policy_controller";
      const reason = envelope.reason ?? "daemon_policy_controller";
      const beforePheromone = currentDaemonMaxPheromoneIntensity();
      const beforePlasmid = currentDaemonMaxPlasmidCharge();

      if (envelope.rollback_token !== undefined) {
        const rollbackKey = inferDaemonPolicyRollbackKey(
          envelope.rollback_token,
        );
        if (rollbackKey === null) {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_invalid_payload",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "INVALID_DAEMON_POLICY_ROLLBACK_TOKEN",
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }
        const rollback = rollbackKey === "daemon.maxPheromoneIntensity"
          ? rollbackDaemonPheromonePolicyLedgerUpdate({
            rollbackToken: envelope.rollback_token,
            source,
            reason,
            tick,
          })
          : rollbackDaemonPlasmidPolicyLedgerUpdate({
            rollbackToken: envelope.rollback_token,
            source,
            reason,
            tick,
          });
        if (rollback.status !== "rolled_back") {
          MUTATION_TELEMETRY.record({
            lane: "external_daemon",
            kind: "daemon_policy_rollback_reject",
            count: 1,
          });
          return new Response(
            JSON.stringify({
              ok: false,
              reason: "DAEMON_POLICY_ROLLBACK_REJECTED",
              ledger_status: rollback.status,
              rollback_token: envelope.rollback_token,
              daemon_policy: serializeDaemonPolicyState(),
            }),
            { status: 409, headers: JSON_HEADERS },
          );
        }

        if (rollback.mutation) {
          if (rollbackKey === "daemon.maxPheromoneIntensity") {
            const persisted = await appendLedgerRecordAndMaybeCompact(
              "daemon.maxPheromoneIntensity",
              recordFromRollback(
                rollback.mutation,
                "daemon.maxPheromoneIntensity",
              ),
              {
                initialValue: DAEMON_POLICY.maxPheromoneIntensity,
                historyLimit: daemonPheromoneLedgerRuntime.historyLimit,
              },
            );
            daemonPheromoneLedgerPersistence = {
              ...persisted,
              hydrated: daemonPheromoneLedgerPersistence.hydrated,
              lastHydratedAt: daemonPheromoneLedgerPersistence.lastHydratedAt,
              lastHydrationError:
                daemonPheromoneLedgerPersistence.lastHydrationError,
            };
          } else {
            const persisted = await appendLedgerRecordAndMaybeCompact(
              "daemon.maxPlasmidCharge",
              recordFromRollback(rollback.mutation, "daemon.maxPlasmidCharge"),
              {
                initialValue: DAEMON_POLICY.maxPlasmidCharge,
                historyLimit: daemonPlasmidLedgerRuntime.historyLimit,
              },
            );
            daemonPlasmidLedgerPersistence = {
              ...persisted,
              hydrated: daemonPlasmidLedgerPersistence.hydrated,
              lastHydratedAt: daemonPlasmidLedgerPersistence.lastHydratedAt,
              lastHydrationError:
                daemonPlasmidLedgerPersistence.lastHydrationError,
            };
          }
        }

        const snapshot: DaemonPolicyUpdateSnapshot = {
          tick,
          source,
          reason,
          mode: "rollback",
          policy_key: rollbackKey,
          ledger_status: rollback.status,
          pheromone_rollback_token:
            rollbackKey === "daemon.maxPheromoneIntensity"
              ? envelope.rollback_token
              : null,
          plasmid_rollback_token: rollbackKey === "daemon.maxPlasmidCharge"
            ? envelope.rollback_token
            : null,
          max_pheromone_intensity_before: beforePheromone,
          max_pheromone_intensity_after: currentDaemonMaxPheromoneIntensity(),
          max_plasmid_charge_before: beforePlasmid,
          max_plasmid_charge_after: currentDaemonMaxPlasmidCharge(),
        };
        setLatestDaemonPolicyUpdate(snapshot);
        MUTATION_TELEMETRY.record({
          lane: "external_daemon",
          kind: "daemon_policy_rollback",
          count: 1,
        });
        await appendDaemonAudit({
          event_type: "DAEMON_POLICY_ROLLBACK",
          tick,
          source: snapshot.source,
          reason: snapshot.reason,
          mode: snapshot.mode,
          policy_key: snapshot.policy_key,
          ledger_status: snapshot.ledger_status,
          rollback_token: snapshot.pheromone_rollback_token ??
            snapshot.plasmid_rollback_token,
          max_pheromone_intensity_before:
            snapshot.max_pheromone_intensity_before,
          max_pheromone_intensity_after: snapshot.max_pheromone_intensity_after,
          max_plasmid_charge_before: snapshot.max_plasmid_charge_before,
          max_plasmid_charge_after: snapshot.max_plasmid_charge_after,
        });
        return new Response(
          JSON.stringify({
            ok: true,
            updated: snapshot,
            daemon_policy: serializeDaemonPolicyState(),
          }),
          {
            status: 200,
            headers: JSON_HEADERS,
          },
        );
      }

      const updateKey = envelope.max_pheromone_intensity !== undefined
        ? "daemon.maxPheromoneIntensity"
        : "daemon.maxPlasmidCharge";
      const result = updateKey === "daemon.maxPheromoneIntensity"
        ? applyDaemonPheromonePolicyLedgerUpdate({
          value: envelope.max_pheromone_intensity!,
          source,
          reason,
          tick,
        })
        : applyDaemonPlasmidPolicyLedgerUpdate({
          value: envelope.max_plasmid_charge!,
          source,
          reason,
          tick,
        });
      if (result.mutation) {
        if (updateKey === "daemon.maxPheromoneIntensity") {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "daemon.maxPheromoneIntensity",
            recordFromApply(result.mutation, "daemon.maxPheromoneIntensity"),
            {
              initialValue: DAEMON_POLICY.maxPheromoneIntensity,
              historyLimit: daemonPheromoneLedgerRuntime.historyLimit,
            },
          );
          daemonPheromoneLedgerPersistence = {
            ...persisted,
            hydrated: daemonPheromoneLedgerPersistence.hydrated,
            lastHydratedAt: daemonPheromoneLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              daemonPheromoneLedgerPersistence.lastHydrationError,
          };
        } else {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "daemon.maxPlasmidCharge",
            recordFromApply(result.mutation, "daemon.maxPlasmidCharge"),
            {
              initialValue: DAEMON_POLICY.maxPlasmidCharge,
              historyLimit: daemonPlasmidLedgerRuntime.historyLimit,
            },
          );
          daemonPlasmidLedgerPersistence = {
            ...persisted,
            hydrated: daemonPlasmidLedgerPersistence.hydrated,
            lastHydratedAt: daemonPlasmidLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              daemonPlasmidLedgerPersistence.lastHydrationError,
          };
        }
      }

      const snapshot: DaemonPolicyUpdateSnapshot = {
        tick,
        source,
        reason,
        mode: "apply",
        policy_key: updateKey,
        ledger_status: result.status,
        pheromone_rollback_token: updateKey === "daemon.maxPheromoneIntensity"
          ? result.mutation?.rollbackToken ?? null
          : null,
        plasmid_rollback_token: updateKey === "daemon.maxPlasmidCharge"
          ? result.mutation?.rollbackToken ?? null
          : null,
        max_pheromone_intensity_before: beforePheromone,
        max_pheromone_intensity_after: currentDaemonMaxPheromoneIntensity(),
        max_plasmid_charge_before: beforePlasmid,
        max_plasmid_charge_after: currentDaemonMaxPlasmidCharge(),
      };
      setLatestDaemonPolicyUpdate(snapshot);
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_policy_update",
        count: 1,
      });
      await appendDaemonAudit({
        event_type: "DAEMON_POLICY",
        tick,
        source: snapshot.source,
        reason: snapshot.reason,
        mode: snapshot.mode,
        policy_key: snapshot.policy_key,
        ledger_status: snapshot.ledger_status,
        rollback_token: snapshot.pheromone_rollback_token ??
          snapshot.plasmid_rollback_token,
        max_pheromone_intensity_before: snapshot.max_pheromone_intensity_before,
        max_pheromone_intensity_after: snapshot.max_pheromone_intensity_after,
        max_plasmid_charge_before: snapshot.max_plasmid_charge_before,
        max_plasmid_charge_after: snapshot.max_plasmid_charge_after,
      });
      return new Response(
        JSON.stringify({
          ok: true,
          updated: snapshot,
          daemon_policy: serializeDaemonPolicyState(),
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        },
      );
    } catch (err) {
      MUTATION_TELEMETRY.record({
        lane: "external_daemon",
        kind: "daemon_policy_exception",
        count: 1,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "DAEMON_POLICY_EXCEPTION",
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
          tick: Number(Atomics.load(MX.tickCounter, 0)),
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
      const recordDaemonCodexAdmission = (
        severity: "MID" | "HIGH" | "BLOCKED",
        requestedAction: string,
        appliedAction: string,
        score: number,
        reason: string,
        sharedCenter: string,
        dominantInvariantVector: string,
      ): void => {
        AKASHA_CODEX.recordDaemonAdmission(
          baseline.tick,
          requestedAction,
          appliedAction,
          severity,
          score,
          reason,
          sharedCenter,
          dominantInvariantVector,
          baseline.glyphTransport,
        );
      };

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
        recordDaemonCodexAdmission(
          "BLOCKED",
          envelope.action_type,
          "BLOCKED",
          0,
          safeMode.reason,
          "safe-mode",
          "none",
        );
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
        recordDaemonCodexAdmission(
          "BLOCKED",
          envelope.action_type,
          "BLOCKED",
          0,
          "DAEMON_RATE_LIMIT_WINDOW_EXCEEDED",
          "budget-window",
          "none",
        );
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
          recordDaemonCodexAdmission(
            "BLOCKED",
            envelope.action_type,
            "BLOCKED",
            0,
            "INVALID_PLASMID_PAYLOAD",
            "policy",
            "none",
          );
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

        if (envelope.payload.intensity > currentDaemonMaxPlasmidCharge()) {
          recordDaemonCodexAdmission(
            "BLOCKED",
            envelope.action_type,
            "BLOCKED",
            0,
            "DAEMON_POLICY_PLASMID_CHARGE_EXCEEDED",
            "policy",
            "none",
          );
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
              max: currentDaemonMaxPlasmidCharge(),
            }),
            { status: 400, headers: JSON_HEADERS },
          );
        }

        const plasmidPolicy = evaluatePlasmidPolicy(envelope.payload.hex_code);
        if (!plasmidPolicy.ok) {
          recordDaemonCodexAdmission(
            "BLOCKED",
            envelope.action_type,
            "BLOCKED",
            0,
            plasmidPolicy.reason,
            "policy",
            "none",
          );
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

      const dominantGenome = dominantGenomes(MX.getActiveIndices(), 1)
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
          baseline.glyphTransport,
        );
      }

      if (applied.action_type === "DROP_PHEROMONE") {
        if (
          applied.payload.intensity > currentDaemonMaxPheromoneIntensity()
        ) {
          recordDaemonCodexAdmission(
            "BLOCKED",
            envelope.action_type,
            applied.action_type,
            ingressPlan.admission.score,
            "DAEMON_POLICY_PHEROMONE_INTENSITY_EXCEEDED",
            ingressPlan.admission.context.sharedCenter,
            ingressPlan.admission.context.dominantInvariantVector,
          );
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
              max: currentDaemonMaxPheromoneIntensity(),
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
            sharedCenter: ingressPlan.admission.context.sharedCenter,
            dominantInvariantVector:
              ingressPlan.admission.context.dominantInvariantVector,
            codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
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
          sharedCenter: ingressPlan.admission.context.sharedCenter,
          dominantInvariantVector:
            ingressPlan.admission.context.dominantInvariantVector,
          codexLineageLabel: ingressPlan.admission.context.codexLineageLabel,
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
        tick: Number(Atomics.load(MX.tickCounter, 0)),
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

  if (url.pathname === "/federate/admission") {
    return new Response(
      JSON.stringify(CONTROL_INTENT_QUEUE.getFederationAdmissionState()),
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
    return new Response(MX.viralGridBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/immunity" && req.method === "GET") {
    const buffer = MX.immuneBuffer;
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
    const buffer = MX.currentReadBuffer;
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
    const buffer = MX.bondStiffnessBuffer;
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
    const BONDS_SIZE = MAX_ATOMS * 4 * 4;
    const view = new Uint8Array(MX.buffer, BONDS_OFFSET, BONDS_SIZE);
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
    const buffer = MX.synapticStackBuffer;
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
    const buffer = MX.structureGridBuffer;
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
    const buffer = MX.memoryGridBuffer;
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
    const buffer = MX.roleRegistryBuffer;
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
            Li(`💉 [GOD_MODE] Injecting: "${text}" (Energy: ${energy})`);
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
  Li("💓 [SYSTEM] Pulse Engine Ignited.");
  const coldstart = COLDSTART_BOOTSTRAP.seed({
    enabled: COLDSTART_POLICY.enabled,
    count: COLDSTART_POLICY.count,
    replicatorRatio: COLDSTART_POLICY.replicatorRatio,
    guardianRatio: COLDSTART_POLICY.guardianRatio,
    seed: COLDSTART_POLICY.seed,
    energy: COLDSTART_POLICY.energy,
    resonance: COLDSTART_POLICY.resonance,
  });
  if (coldstart.skipped) {
    Li(`🌱 [COLDSTART] ${coldstart.reason}`);
  } else {
    Li(
      `🌱 [COLDSTART] seeded=${coldstart.seeded}/${coldstart.configuredCount} replicators=${coldstart.replicators} architects=${coldstart.architects} seed=${coldstart.seed}`,
    );
  }

  const isGenesisRun = Deno.args.includes("--genesis") ||
    Deno.args.includes("--autonomous");
  if (isGenesisRun) {
    Li(
      "🌀 [GENESIS] Autonomous Genesis Run Active. Matrix is self-driving 24/7.",
    );
    try {
      Deno.addSignalListener("SIGINT", async () => {
        Li(
          "🛑 [GENESIS] Genesis Interrupted by SIGINT! Saving final Genesis Block before exit...",
        );
        const tick = Number(Atomics.load(MX.tickCounter, 0));
        await SNAPSHOT_ENGINE.exportSnapshot({
          tick,
          reason: "genesis_shutdown",
          prune: false,
          retention: 0,
        });
        Li(
          `💾 [GENESIS] Genesis Block Saved at tick ${tick}. Terminating.`,
        );
        Deno.exit(0);
      });
    } catch {
      // Deno.addSignalListener is not supported on Windows, silently ignore
    }
  }

  await syncDaemonPheromonePolicyLedgerHydration();
  await syncDaemonPlasmidPolicyLedgerHydration();

  PULSE.setOracleDelegate({
    setNeuralCoherence: (c: number) => {
      SOVEREIGN_ORACLE.neuralCoherence = c;
    },
    getNeuralCoherence: () => SOVEREIGN_ORACLE.neuralCoherence,
    gatherEpochTelemetry: () => SOVEREIGN_ORACLE.gatherEpochTelemetry(),
    broadcastWhisper: (t: number, tel: any, c: number) =>
      SOVEREIGN_ORACLE.broadcastWhisper(t, tel, c),
    consultOracle: (idx: number, tel: any) =>
      SOVEREIGN_ORACLE.consultOracle(idx, tel),
    drainPendingMutations: () => SOVEREIGN_ORACLE.drainPendingMutations(),
  });

  PULSE.setAkashaDelegate({
    recordMutationTelemetry: (e: any) => MUTATION_TELEMETRY.record(e),
    flushMutationTelemetry: (t: number) => MUTATION_TELEMETRY.flushIfDue(t),
    compressMemory: (m: any) => compressMemory(m),
    decompressMemoryToLattice: (m: any, p: any) =>
      decompressMemoryToLattice(m, p),
    saveEpoch: (
      m: any,
      t: number,
      l: string,
      p1: number,
      p2: number,
      h: string,
    ) => saveEpoch(m as any, t, l, p1, p2, h),
    broadcastPanopticonFrame: (f: ArrayBuffer) =>
      PANOPTICON_SERVER.broadcastBinaryFrame(f),
    recordImmunologicalPurge: (c: number) =>
      AKASHA_CODEX.recordImmunologicalPurge(c),
    observePulseCodex: (t: number, p: number, g: any, s: number) =>
      AKASHA_CODEX.observePulse(t, p, g, s),
    saveSnap: async (t: number) => {
      await SNAP_ENGINE.save(t);
    },
    cleanupSnap: (r: number) => SNAP_ENGINE.cleanup(r),
  });

  const NEXUS_DAEMON = createSwarmNexus({
    instanceId: 1,
    seedNodes: [],
  });

  NEXUS_DAEMON.onAtomTransit = PULSE.onRemoteAtomTransit;
  NEXUS_DAEMON.onSyncRequest = PULSE.onRemoteSyncRequest;
  NEXUS_DAEMON.onEpochPayload = PULSE.onRemoteEpochPayload;

  PULSE.setAkashaDelegate({
    recordMutationTelemetry: (ev) => MUTATION_TELEMETRY.record(ev as any),
    flushMutationTelemetry: (t: number) => MUTATION_TELEMETRY.flushIfDue(t),
    compressMemory: async (m) => await compressMemory(m),
    decompressMemoryToLattice: async (m, p) => await decompressMemoryToLattice(m, p),
    saveEpoch: async (m, t, l, p1, p2, h) => await saveEpoch(m as any, t, l, p1, p2, h),
    broadcastPanopticonFrame: (f) => PANOPTICON_SERVER.broadcastBinaryFrame(f),
    recordImmunologicalPurge: async (c) => await AKASHA_CODEX.recordImmunologicalPurge(c),
    observePulseCodex: (t, p, g, s) => AKASHA_CODEX.observePulse(t, p, g, s),
    saveSnap: async (t) => {
      await SNAPSHOT_ENGINE.exportSnapshot({ tick: t });
    },
    cleanupSnap: (r) => SNAPSHOT_ENGINE.pruneSnapshots(r),
  });

  CONTROL_INTENT_QUEUE.setDelegate({
    recordTelemetry: (ev: { lane: string; kind: string; count: number }) => MUTATION_TELEMETRY.record(ev as any),
    importSnapshot: (ts: string) => SNAPSHOT_ENGINE.importSnapshot(ts),
    unpackAtom: (packet: Uint8Array) => P2P_CODEC.unpackAtom(packet),
  });

  P2P_FEDERATION.setUpwardDelegate({
    recordTelemetry: (e: any) => MUTATION_TELEMETRY.record(e),
    lookupLineageProfile: (l: string) => AKASHA_CODEX.lookupLineageProfile(l),
    captureBehaviorFrame: (idx: number) =>
      SEMANTIC_MEMBRANE.captureBehaviorFrame(idx),
  });

  SOVEREIGN_ORACLE.setAkashaDelegate({
    recordTelemetry: (e: any) => MUTATION_TELEMETRY.record(e),
    appendObserverCommentary: (t: number, ep: number, m: string) =>
      AKASHA_CODEX.appendObserverCommentary(t, ep, m),
  });

  PULSE.setNoosphereDelegate({
    unpackAtom: (p) => P2P_CODEC.unpackAtom(p),
    packAtom: (i) => P2P_CODEC.packAtom(i),
    evaluateHeartbeat: (t, h, p, e) => SWARM_NODE.evaluateHeartbeat(t, h, p, e),
    sendEpochPayload: (p, f) => NEXUS_DAEMON.sendEpochPayload(p, f),
    routeAtom: (p) => NEXUS_DAEMON.routeAtom(p),
    startNexus: () => NEXUS_DAEMON.start(),
    broadcastSyncRequest: () => NEXUS_DAEMON.broadcastSyncRequest(),
    broadcastEpochConsensus: (t, h) =>
      NEXUS_DAEMON.broadcastEpochConsensus(t, h),
    getNexusStatus: () => ({
      mainnetEnabled: NEXUS_DAEMON.mainnetEnabled,
      bootstrapHubUrl: NEXUS_DAEMON.bootstrapHubUrl ?? "",
      seedNodesLength: NEXUS_DAEMON.seedNodes.length,
      localCurrentTick: NEXUS_DAEMON.localCurrentTick,
      localTps: NEXUS_DAEMON.localTps,
    }),
    setNexusStatus: (s) => {
      if (s.mainnetEnabled !== undefined) {
        NEXUS_DAEMON.mainnetEnabled = s.mainnetEnabled;
      }
      if (s.bootstrapHubUrl !== undefined) {
        NEXUS_DAEMON.bootstrapHubUrl = s.bootstrapHubUrl;
      }
      if (s.localCurrentTick !== undefined) {
        NEXUS_DAEMON.localCurrentTick = s.localCurrentTick;
      }
      if (s.localTps !== undefined) NEXUS_DAEMON.localTps = s.localTps;
    },
    getMedianSwarmTick: (t) => NEXUS_DAEMON.getMedianSwarmTick(t),
  });

  await PULSE.initWorkers();

  let lastOracleTick = 0;
  const intervalArg = Deno.args.find((a) =>
    a.startsWith("--genesis-interval=")
  );
  const genesisInterval = intervalArg
    ? Number(intervalArg.split("=")[1])
    : 10000;

  // Phase 48: Eschaton Trackers
  let stagnantTicks = 0;
  let lastPopulation = -1;
  const STAGNATION_THRESHOLD = 10000;

  while (true) {
    await PULSE.tick();
    const tick = Number(Atomics.load(MX.tickCounter, 0));

    if (tick % 100 === 0) {
      LINEAGE_TRACKER.updateMetrics(tick);
    }

    await flushDaemonAuditEffects(tick);
    await maybeAutoSnapshot(tick);
    if (
      telemetryStreamLastTick < 0 ||
      tick - telemetryStreamLastTick >= TELEMETRY_STREAM_EMIT_INTERVAL_TICKS
    ) {
      const metrics = collectRuntimeMetrics();
      const safeMode = isDaemonSafeMode(metrics);
      const glyphSnap = GLYPH_TELEMETRY.snapshot();

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

    if (isGenesisRun && tick - lastOracleTick >= genesisInterval) {
      const epoch = Math.floor(tick / genesisInterval);
      const metrics = collectRuntimeMetrics();
      const { dominantMeme, destructiveMeme } = LINEAGE_TRACKER.closeEpoch(
        tick,
      );
      const telemetry = {
        epoch,
        population: metrics.population,
        avgEnergy: metrics.avgEnergy,
        neuralCoherence: metrics.neuralCoherence,
        entropyPressure: MX.get_hormone(0),
        dominantMeme,
        destructiveMeme,
      };

      // Phase 48 Stagnation Check
      let eschatonReason: string | null = null;
      const epochTelemetry = SOVEREIGN_ORACLE.gatherEpochTelemetry();
      const topGenome = epochTelemetry.dominant_genomes[0];
      const isMonoculture = topGenome &&
        (topGenome.count / Math.max(1, metrics.population)) > 0.90;

      if (metrics.neuralCoherence >= 10000) {
        eschatonReason = "Absolute Order (Singularity of Coherence)";
      } else if (metrics.population > 0 && isMonoculture) {
        eschatonReason = "Leviathan Victory (Absolute Monoculture)";
      } else if (
        metrics.population > 0 && metrics.avgEnergy < 10 &&
        Math.abs(metrics.population - lastPopulation) < 5
      ) {
        stagnantTicks += genesisInterval;
        if (stagnantTicks >= STAGNATION_THRESHOLD) {
          eschatonReason = "Heat Death (Energetic and Memetic Stagnation)";
        }
      } else {
        stagnantTicks = 0;
      }
      lastPopulation = metrics.population;

      if (eschatonReason) {
        await SOVEREIGN_ORACLE.declareEschaton(eschatonReason);
        MX.clear();
        mutateUniversalConstants();
        stagnantTicks = 0;
        lastOracleTick = tick;
        Li(
          "🌀 [ESCHATON] The Matrix has been reset. A new Kalpa begins.",
        );
        // We do not consult the Oracle for a normal plasmid on Kalpa boundary
        continue;
      }

      // For testing speed: always run the first interval.
      SOVEREIGN_ORACLE.consultAutonomousOracle(telemetry).catch((e) =>
        Le("[GENESIS] Oracle Loop Failed:", e)
      );
      lastOracleTick = tick;
    }

    await new Promise((r) => setTimeout(r, 16));
  }
})();

// 3. Start Panopticon Telemetry Server (Background)
(() => {
  PANOPTICON_SERVER.start();
})();

// 4. Start Cognitive Breathing Loop (Background)
(async () => {
  Li("🌬️ [SYSTEM] Breathing Daemon Waiting for first pulse...");
  await new Promise((r) => setTimeout(r, 5000));
  await BREATH.inhale();
})();
