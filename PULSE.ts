// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
import {
  MAX_ATOMS,
  RISC,
  sharedBuffer,
  STATE_MATRIX,
  SYS,
} from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { SOVEREIGN_ORACLE } from "./SOVEREIGN_ORACLE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { GATE } from "./GATE.ts";
import { PREDICTION_MARKET } from "./PREDICTION_MARKET.ts";
import { LOGGER } from "./LOGGER.ts";
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";
import { CONTROL_INTENT_QUEUE } from "./CONTROL_INTENT_QUEUE.ts";
import {
  compressMemory,
  decompressMemoryToLattice,
  saveEpoch,
} from "./CONTINUUM.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";
import { P2P_CODEC } from "./P2P_CODEC.ts";
import { SWARM_NODE } from "./SWARM_NODE.ts";
import { SwarmNexus } from "./network/SWARM_NEXUS.ts";
import { PANOPTICON_SERVER } from "./PANOPTICON_SERVER.ts";

export const NEXUS_DAEMON = new SwarmNexus({
  instanceId: 1,
  seedNodes: [],
});

NEXUS_DAEMON.onAtomTransit = (payload: Uint8Array) => {
  const newIdx = P2P_CODEC.unpackAtom(payload);
  if (newIdx !== -1) {
    const id = STATE_MATRIX.getId(newIdx);
    LOGGER.info(`🛸 [PULSE] Atom ${id} materialized from hyperspace at index ${newIdx}.`);
    MUTATION_TELEMETRY.record({
      lane: "external_ingress",
      kind: "federation_migration_clear",
      count: 1,
    });
  } else {
    LOGGER.warn(`🛸 [PULSE] Ingress atom failed to materialize (Lattice full or corrupt).`);
  }
};

let genesisPromiseResolver: (() => void) | null = null;

NEXUS_DAEMON.onSyncRequest = async (peerId: string) => {
  LOGGER.info(
    `[PULSE] Serving Hot State Merging Genesis block to ${peerId}...`,
  );
  const payload = await compressMemory(STATE_MATRIX.wasmMemory);
  NEXUS_DAEMON.sendEpochPayload(peerId, payload);
};

NEXUS_DAEMON.onEpochPayload = async (payload: Uint8Array) => {
  LOGGER.info(
    `[PULSE] Hot State Merging payload received. Unpacking into Lattice...`,
  );
  await decompressMemoryToLattice(STATE_MATRIX.wasmMemory, payload);
  if (genesisPromiseResolver) {
    genesisPromiseResolver();
    genesisPromiseResolver = null;
  }
};

const MAX_TICK_DRIFT = 50;
let lastTickTime = performance.now();
let lastPanopticonBroadcastTime = 0;
let tickCountLog = 0;

import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { AKASHA_CODEX } from "./AKASHA_CODEX.ts";
import { GLYPH_BUFFER } from "./GLYPH_BUFFER.ts";
import { SNAP_ENGINE } from "./SNAP_ENGINE.ts";
import { DAEMON_INGRESS_POLICY_LIMITS } from "./DAEMON_INGRESS_POLICY.ts";
import { IMMUNE } from "./IMMUNE.ts";

import { syncHormonesToLattice } from "./HORMONE_BUFFER_RUNTIME.ts";
import {
  createPhysiologicalLedgerRuntime,
  HORMONE_BUFFER_CATALOG,
  type HormoneId,
} from "./HORMONE_BUFFER.ts";
import {
  applyLedgerUpdate,
  createGeneticLedgerRuntime,
  createLedgerRuntime,
  type LedgerRuntimeSnapshot,
  type LedgerRuntimeState,
  rollbackLedgerUpdate,
  snapshotLedgerRuntime,
} from "./GENERIC_LEDGER_SYSTEM.ts";
import { type GeneticLedgerKey } from "./GENETIC_LEDGER.ts";
import {
  appendLedgerRecordAndMaybeCompact,
  getLogPath,
  getSnapshotPath,
  hydrateLedgerRuntime,
  type LedgerPersistenceSummary,
  recordFromApply,
  recordFromRollback,
} from "./GENERIC_LEDGER_PERSISTENCE.ts";

import { DriftWarden } from "./reduction_core/DRIFT_WARDEN.ts";
import { DollFork } from "./reduction_core/doll_fork/DOLL_FORK_MATRIX.ts";
import { DollForkRunner } from "./reduction_core/doll_fork/DOLL_FORK_RUNNER.ts";
import { REIFIED_PROGRAMS } from "./reduction_core/GENESIS_REIFIED.ts";
import { GenesisInceptor } from "./reduction_core/GENESIS_INCEPTOR.ts";
import { LineageTracker } from "./reduction_core/relics/LINEAGE_TRACKER.ts";
import { QuorumAdvocate } from "./reduction_core/relics/QUORUM_ADVOCATE.ts";

const WORKER_COUNT = RUNTIME_POLICY.pulse.workerCount;
const STRICT_DETERMINISM = RUNTIME_POLICY.pulse.strictDeterminism;
const WORKER_RESPONSE_TIMEOUT_MS = RUNTIME_POLICY.pulse.workerResponseTimeoutMs;
const WORKER_TIMEOUT_RETRY_COUNT = RUNTIME_POLICY.pulse.workerTimeoutRetryCount;
const WORKER_TIMEOUT_RETRY_MS = RUNTIME_POLICY.pulse.workerTimeoutRetryMs;
const WORKER_RECOVERY_LOG_COOLDOWN_MS = 5_000;
const WORKER_RECOVERY_VERBOSE = RUNTIME_POLICY.pulse.workerRecoveryVerbose;
const WORKER_INIT_FALLBACK_ENABLED =
  RUNTIME_POLICY.pulse.workerInitFallbackEnabled;
const WASM_BOOT_POLICY = RUNTIME_POLICY.pulse.wasmBootPolicy;
const WASM_BOOT_PRECHECK_ENABLED = RUNTIME_POLICY.pulse.wasmBootPrecheckEnabled;
const FORCE_WASM_PREFLIGHT_FAIL = RUNTIME_POLICY.pulse.forceWasmPreflightFail;
const STARTUP_SELFTEST_ENABLED = RUNTIME_POLICY.pulse.startupSelfTestEnabled;
const STARTUP_SELFTEST_TICKS = RUNTIME_POLICY.pulse.startupSelfTestTicks;
const STARTUP_SELFTEST_FALLBACK_ENABLED =
  RUNTIME_POLICY.pulse.startupSelfTestFallbackEnabled;
const STARTUP_SELFTEST_QUIET = RUNTIME_POLICY.pulse.startupSelfTestQuiet;
const STARTUP_SELFTEST_FORCE_BREACH =
  RUNTIME_POLICY.pulse.startupSelfTestForceBreach;
const PRESSURE_RING_BASELINE = RUNTIME_POLICY.pulse.pressureRing;
const PRESSURE_RING_TAU = Math.PI * 2;
const PRESSURE_RING_SCALE_MAX = 2048;
const PRESSURE_TERM_ABS_MAX = 2048;
const BASE_NOVELTY_SIGNED = RUNTIME_POLICY.pulse.noveltyPressureSigned;
const BASE_SYMBIOSIS_SIGNED = RUNTIME_POLICY.pulse.symbiosisPressureSigned;
const BASE_NOVELTY = RUNTIME_POLICY.pulse.noveltyPressure;
const BASE_FEAR = RUNTIME_POLICY.pulse.fearPressure;
const BASE_SYMBIOSIS = RUNTIME_POLICY.pulse.symbiosisPressure;
const BASE_EGO = RUNTIME_POLICY.pulse.egoPressure;
const HOMEOSTASIS_POLICY = RUNTIME_POLICY.pulse.homeostasis;
const HOMEOSTASIS_ENABLED = HOMEOSTASIS_POLICY.enabled;
const HOMEOSTASIS_TARGET_ENERGY = HOMEOSTASIS_POLICY.targetEnergy;
const HOMEOSTASIS_BAND = Math.max(1, HOMEOSTASIS_POLICY.band);
const HOMEOSTASIS_MAX_DELTA = Math.max(1, HOMEOSTASIS_POLICY.maxDelta);
const HOMEOSTASIS_OVERFLOW_THRESHOLD = HOMEOSTASIS_POLICY.overflowThreshold;
const HOMEOSTASIS_STARVATION_FLOOR = HOMEOSTASIS_POLICY.starvationFloor;
const HOMEOSTASIS_BASE_TAX = Math.max(0, HOMEOSTASIS_POLICY.baseTax ?? 0);
const GUARDIAN_SIGNAL_EXECUTION_MODE =
  RUNTIME_POLICY.pulse.guardianSignalExecutionMode;
const ARCHITECT_PLASMID_EXECUTION_MODE =
  RUNTIME_POLICY.pulse.architectPlasmidExecutionMode;
const REPLICATION_EXECUTION_MODE =
  RUNTIME_POLICY.pulse.replicationExecutionMode;
const HOMEOSTASIS_SUBSIDY_ENABLED = HOMEOSTASIS_POLICY.subsidyEnabled === true;
const HOMEOSTASIS_BASE_TAX_MIN = 0;
const HOMEOSTASIS_BASE_TAX_MAX = 1024;
const HOMEOSTASIS_TARGET_ENERGY_MIN = 1;
const HOMEOSTASIS_TARGET_ENERGY_MAX = 1_000_000;
const SPAWN_RING_CAPACITY = 1024;
const SPAWN_SLOT_BYTES = 16;
const WASM_RELEASE_URL = new URL("./build/release.wasm", import.meta.url);

type EvolutionPressureState = {
  noveltySigned: number;
  symbiosisSigned: number;
  novelty: number;
  fear: number;
  symbiosis: number;
  ego: number;
  ring: {
    enabled: boolean;
    theta: number;
    scale: number;
    fearCuriosityBalance: number;
    egoLoveBalance: number;
  };
};
type SpatialHashState = {
  tick: number;
  overflowCount: number;
  maxCellCount: number;
  overflowRatio: number;
};
type HomeostasisState = {
  enabled: boolean;
  targetEnergy: number;
  targetEnergyDefault: number;
  targetEnergyCurrent: number;
  band: number;
  maxDelta: number;
  overflowThreshold: number;
  starvationFloor: number;
  subsidyEnabled: boolean;
  baseTaxDefault: number;
  baseTaxCurrent: number;
  lastUpdateTick: number;
  lastUpdateSource: string;
  lastUpdateReason: string;
};
type GeneticLedgerRuntimeState = {
  homeostasisBaseTax: LedgerRuntimeSnapshot<"pulse.homeostasis.baseTax">;
  homeostasisBaseTaxPersistence: LedgerPersistenceSummary;
  homeostasisTargetEnergy: LedgerRuntimeSnapshot<
    "pulse.homeostasis.targetEnergy"
  >;
  homeostasisTargetEnergyPersistence: LedgerPersistenceSummary;
  pressureRingScale: LedgerRuntimeSnapshot<"pulse.pressureRing.scale">;
  pressureRingScalePersistence: LedgerPersistenceSummary;
  homeostasisBand: LedgerRuntimeSnapshot<"pulse.homeostasis.band">;
  homeostasisBandPersistence: LedgerPersistenceSummary;
  homeostasisMaxDelta: LedgerRuntimeSnapshot<"pulse.homeostasis.maxDelta">;
  homeostasisMaxDeltaPersistence: LedgerPersistenceSummary;
  homeostasisOverflowThreshold: LedgerRuntimeSnapshot<
    "pulse.homeostasis.overflowThreshold"
  >;
  homeostasisOverflowThresholdPersistence: LedgerPersistenceSummary;
  daemonMaxActions: LedgerRuntimeSnapshot<"daemon.maxActionsPerWindow">;
  daemonMaxActionsPersistence: LedgerPersistenceSummary;
  federationDegradeEnergyRatio: LedgerRuntimeSnapshot<
    "federation.admission.degradeEnergyRatio"
  >;
  federationDegradeEnergyRatioPersistence: LedgerPersistenceSummary;
};
type GuardianSignalHybridState = {
  mode: GuardianSignalExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  stableBranchCount: number;
  repairBranchCount: number;
  allowedGuardianSignals: number;
  suppressedGuardianSignals: number;
  shadowSuppressedGuardianSignals: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "stable"
    | "repair"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: "stable" | "repair" | "unknown";
  lastFallbackReason: string;
  lastMode?: GuardianSignalExecutionMode;
};
type ArchitectPlasmidHybridState = {
  mode: ArchitectPlasmidExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  allowedArchitectPlasmids: number;
  suppressedArchitectPlasmids: number;
  shadowSuppressedArchitectPlasmids: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "emit"
    | "suppress"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: "emit" | "suppress" | "unknown";
  lastFallbackReason: string;
  lastMode?: ArchitectPlasmidExecutionMode;
};

const clampPressureTerm = (value: number): number =>
  Math.max(-PRESSURE_TERM_ABS_MAX, Math.min(PRESSURE_TERM_ABS_MAX, value | 0));
const clampRingScale = (value: number): number =>
  Math.max(0, Math.min(PRESSURE_RING_SCALE_MAX, value | 0));
const clampHomeostasisBaseTax = (value: number): number =>
  Math.max(
    HOMEOSTASIS_BASE_TAX_MIN,
    Math.min(HOMEOSTASIS_BASE_TAX_MAX, Math.round(value)),
  );
const clampHomeostasisTargetEnergy = (value: number): number =>
  Math.max(
    HOMEOSTASIS_TARGET_ENERGY_MIN,
    Math.min(HOMEOSTASIS_TARGET_ENERGY_MAX, Math.round(value)),
  );
const normalizeTheta = (theta: number): number => {
  if (!Number.isFinite(theta)) return 0;
  const wrapped = theta % PRESSURE_RING_TAU;
  return wrapped >= 0 ? wrapped : wrapped + PRESSURE_RING_TAU;
};
const pressureComponentFromUnit = (component: number, scale: number): number =>
  Math.max(
    0,
    Math.min(PRESSURE_TERM_ABS_MAX, Math.round(Math.max(0, component) * scale)),
  );
const deriveRingPressure = (theta: number, scale: number) => {
  const normalizedTheta = normalizeTheta(theta);
  const boundedScale = clampRingScale(scale);
  const fearCuriosityBalance = Math.cos(normalizedTheta);
  const egoLoveBalance = Math.sin(normalizedTheta);
  const novelty = pressureComponentFromUnit(fearCuriosityBalance, boundedScale);
  const fear = pressureComponentFromUnit(-fearCuriosityBalance, boundedScale);
  const symbiosis = pressureComponentFromUnit(egoLoveBalance, boundedScale);
  const ego = pressureComponentFromUnit(-egoLoveBalance, boundedScale);
  return {
    novelty,
    fear,
    noveltySigned: novelty - fear,
    symbiosis,
    ego,
    symbiosisSigned: symbiosis - ego,
    ring: {
      enabled: true,
      theta: normalizedTheta,
      scale: boundedScale,
      fearCuriosityBalance,
      egoLoveBalance,
    },
  };
};
const BASE_EVOLUTION_PRESSURE_STATE: EvolutionPressureState = {
  noveltySigned: clampPressureTerm(BASE_NOVELTY_SIGNED),
  symbiosisSigned: clampPressureTerm(BASE_SYMBIOSIS_SIGNED),
  novelty: clampPressureTerm(BASE_NOVELTY),
  fear: clampPressureTerm(BASE_FEAR),
  symbiosis: clampPressureTerm(BASE_SYMBIOSIS),
  ego: clampPressureTerm(BASE_EGO),
  ring: {
    enabled: PRESSURE_RING_BASELINE.enabled,
    theta: normalizeTheta(PRESSURE_RING_BASELINE.theta),
    scale: clampRingScale(PRESSURE_RING_BASELINE.scale),
    fearCuriosityBalance: PRESSURE_RING_BASELINE.fearCuriosityBalance,
    egoLoveBalance: PRESSURE_RING_BASELINE.egoLoveBalance,
  },
};
let evolutionPressureState: EvolutionPressureState = {
  ...BASE_EVOLUTION_PRESSURE_STATE,
};
const createGuardianSignalHybridState = (
  mode: GuardianSignalExecutionMode,
): GuardianSignalHybridState => ({
  mode,
  hybridRuns: 0,
  shadowRuns: 0,
  fallbackRuns: 0,
  stableBranchCount: 0,
  repairBranchCount: 0,
  allowedGuardianSignals: 0,
  suppressedGuardianSignals: 0,
  shadowSuppressedGuardianSignals: 0,
  lastTick: -1,
  lastStatus: "legacy",
  lastBranch: "unknown",
  lastFallbackReason: "",
});
const snapshotGuardianSignalHybridState = (): GuardianSignalHybridState => ({
  ...guardianSignalHybridState,
});
const createArchitectPlasmidHybridState = (
  mode: ArchitectPlasmidExecutionMode,
): ArchitectPlasmidHybridState => ({
  mode,
  hybridRuns: 0,
  shadowRuns: 0,
  fallbackRuns: 0,
  emitBranchCount: 0,
  suppressBranchCount: 0,
  allowedArchitectPlasmids: 0,
  suppressedArchitectPlasmids: 0,
  shadowSuppressedArchitectPlasmids: 0,
  lastTick: -1,
  lastStatus: "legacy",
  lastBranch: "unknown",
  lastFallbackReason: "",
});
const snapshotArchitectPlasmidHybridState =
  (): ArchitectPlasmidHybridState => ({
    ...architectPlasmidHybridState,
  });
const createReplicationHybridState = (
  mode: ReplicationExecutionMode,
): ReplicationHybridState => ({
  mode,
  hybridRuns: 0,
  shadowRuns: 0,
  fallbackRuns: 0,
  emitBranchCount: 0,
  suppressBranchCount: 0,
  allowedReplications: 0,
  suppressedReplications: 0,
  shadowSuppressedReplications: 0,
  lastTick: -1,
  lastStatus: "legacy",
  lastBranch: "unknown",
  lastFallbackReason: "",
});
const snapshotReplicationHybridState = (): ReplicationHybridState => ({
  ...replicationHybridState,
});
const guardianSignalHybridState = createGuardianSignalHybridState(
  GUARDIAN_SIGNAL_EXECUTION_MODE,
);
const architectPlasmidHybridState = createArchitectPlasmidHybridState(
  ARCHITECT_PLASMID_EXECUTION_MODE,
);
const replicationHybridState = createReplicationHybridState(
  REPLICATION_EXECUTION_MODE,
);

const createLedgerPersistence = (key: any): LedgerPersistenceSummary => ({
  path: getLogPath(key),
  snapshotPath: getSnapshotPath(key),
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
});
let runtimeWorkerCount = WORKER_COUNT;
let startupSelfTestDone = false;
let startupSelfTestInProgress = false;
let startupSelfTestFallbackActivated = false;
let startupSelfTestLastBreachTick = -1;
let initFallbackActivated = false;
let initFallbackReason = "";
let wasmBootDegraded = false;
let wasmBootReason = "";
let wasmBootArtifactBytes = 0;
let wasmBootPrecheckCompleted = false;
let spatialHashState: SpatialHashState = {
  tick: -1,
  overflowCount: 0,
  maxCellCount: 0,
  overflowRatio: 0,
};
let homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(HOMEOSTASIS_BASE_TAX);
let homeostasisBaseTaxLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.baseTax",
);
let homeostasisBaseTaxLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.baseTax",
);

// GENERIC LEDGER REGISTRY (Stage 7.2)
let homeostasisBandLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.band",
);
let homeostasisMaxDeltaLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.maxDelta",
);
let homeostasisOverflowThresholdLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.overflowThreshold",
);
let daemonMaxActionsLedgerRuntime = createGeneticLedgerRuntime(
  "daemon.maxActionsPerWindow",
);
let federationDegradeEnergyRatioLedgerRuntime = createGeneticLedgerRuntime(
  "federation.admission.degradeEnergyRatio",
);

let homeostasisBandLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.band",
);
let homeostasisMaxDeltaLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.maxDelta",
);
let homeostasisOverflowThresholdLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.overflowThreshold",
);
let daemonMaxActionsLedgerPersistence = createLedgerPersistence(
  "daemon.maxActionsPerWindow",
);
let federationDegradeEnergyRatioLedgerPersistence = createLedgerPersistence(
  "federation.admission.degradeEnergyRatio",
);
let homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
  HOMEOSTASIS_TARGET_ENERGY,
);
let homeostasisTargetEnergyLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.targetEnergy",
);
let homeostasisTargetEnergyLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.targetEnergy",
);
let pressureRingScaleLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.pressureRing.scale",
);
let pressureRingScaleLedgerPersistence = createLedgerPersistence(
  "pulse.pressureRing.scale",
);

const physiologicalLedgers = Object.fromEntries(
  HORMONE_BUFFER_CATALOG.map((spec) => [
    spec.id,
    createPhysiologicalLedgerRuntime(spec.id),
  ]),
) as Record<HormoneId, LedgerRuntimeState<HormoneId>>;

let homeostasisLastUpdateTick = -1;
let homeostasisLastUpdateSource = "runtime_policy";
let homeostasisLastUpdateReason = "bootstrap";
const resetStartupSelfTestStateForColdStart = (): void => {
  startupSelfTestDone = false;
  startupSelfTestFallbackActivated = false;
  startupSelfTestLastBreachTick = -1;
  initFallbackActivated = false;
  initFallbackReason = "";
  wasmBootDegraded = false;
  wasmBootReason = "";
  wasmBootArtifactBytes = 0;
  wasmBootPrecheckCompleted = false;
  for (const spec of HORMONE_BUFFER_CATALOG) {
    physiologicalLedgers[spec.id] = createPhysiologicalLedgerRuntime(spec.id);
  }
};
const resetSpatialHashStateForColdStart = (): void => {
  spatialHashState = {
    tick: -1,
    overflowCount: 0,
    maxCellCount: 0,
    overflowRatio: 0,
  };
};
const resetHomeostasisStateForColdStart = (): void => {
  homeostasisBaseTaxLedgerRuntime = createGeneticLedgerRuntime(
    "pulse.homeostasis.baseTax",
    HOMEOSTASIS_BASE_TAX,
    homeostasisBaseTaxLedgerRuntime.historyLimit,
  );
  homeostasisBaseTaxLedgerRuntime.lastAppliedReason = "coldstart_reset";
  homeostasisBaseTaxLedgerRuntime.lastRollbackReason = "coldstart_reset";
  homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(
    homeostasisBaseTaxLedgerRuntime.currentValue,
  );
  homeostasisBaseTaxLedgerPersistence = {
    ...homeostasisBaseTaxLedgerPersistence,
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
    lastCompactedAt: null,
    lastCompactedTick: -1,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
  homeostasisTargetEnergyLedgerRuntime = createGeneticLedgerRuntime(
    "pulse.homeostasis.targetEnergy",
    HOMEOSTASIS_TARGET_ENERGY,
    homeostasisTargetEnergyLedgerRuntime.historyLimit,
  );
  homeostasisTargetEnergyLedgerRuntime.lastAppliedReason = "coldstart_reset";
  homeostasisTargetEnergyLedgerRuntime.lastRollbackReason = "coldstart_reset";
  homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyLedgerRuntime.currentValue,
  );
  homeostasisTargetEnergyLedgerPersistence = {
    ...homeostasisTargetEnergyLedgerPersistence,
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
    lastCompactedAt: null,
    lastCompactedTick: -1,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
  homeostasisLastUpdateTick = -1;
  homeostasisLastUpdateSource = "runtime_policy";
  homeostasisLastUpdateReason = "coldstart_reset";
};
const resetEvolutionPressureStateForColdStart = (): void => {
  pressureRingScaleLedgerRuntime = createGeneticLedgerRuntime(
    "pulse.pressureRing.scale",
    PRESSURE_RING_BASELINE.scale,
    pressureRingScaleLedgerRuntime.historyLimit,
  );
  pressureRingScaleLedgerRuntime.lastAppliedReason = "coldstart_reset";
  pressureRingScaleLedgerRuntime.lastRollbackReason = "coldstart_reset";
  pressureRingScaleLedgerPersistence = {
    ...pressureRingScaleLedgerPersistence,
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
    lastCompactedAt: null,
    lastCompactedTick: -1,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
  evolutionPressureState = {
    ...BASE_EVOLUTION_PRESSURE_STATE,
    ring: {
      ...BASE_EVOLUTION_PRESSURE_STATE.ring,
      scale: clampRingScale(pressureRingScaleLedgerRuntime.currentValue),
    },
  };
};
const snapshotHomeostasisState = (): HomeostasisState => ({
  enabled: HOMEOSTASIS_ENABLED,
  targetEnergy: clampHomeostasisTargetEnergy(homeostasisTargetEnergyRuntime),
  targetEnergyDefault: HOMEOSTASIS_TARGET_ENERGY,
  targetEnergyCurrent: clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyRuntime,
  ),
  band: homeostasisBandLedgerRuntime.currentValue,
  maxDelta: homeostasisMaxDeltaLedgerRuntime.currentValue,
  overflowThreshold: homeostasisOverflowThresholdLedgerRuntime.currentValue,
  starvationFloor: HOMEOSTASIS_STARVATION_FLOOR,
  subsidyEnabled: HOMEOSTASIS_SUBSIDY_ENABLED,
  baseTaxDefault: HOMEOSTASIS_BASE_TAX,
  baseTaxCurrent: clampHomeostasisBaseTax(homeostasisBaseTaxRuntime),
  lastUpdateTick: homeostasisLastUpdateTick,
  lastUpdateSource: homeostasisLastUpdateSource,
  lastUpdateReason: homeostasisLastUpdateReason,
});
const snapshotGeneticLedgerRuntimeState = (): GeneticLedgerRuntimeState => ({
  homeostasisBaseTax: snapshotLedgerRuntime(homeostasisBaseTaxLedgerRuntime),
  homeostasisBaseTaxPersistence: { ...homeostasisBaseTaxLedgerPersistence },
  homeostasisTargetEnergy: snapshotLedgerRuntime(
    homeostasisTargetEnergyLedgerRuntime,
  ),
  homeostasisTargetEnergyPersistence: {
    ...homeostasisTargetEnergyLedgerPersistence,
  },
  pressureRingScale: snapshotLedgerRuntime(pressureRingScaleLedgerRuntime),
  pressureRingScalePersistence: { ...pressureRingScaleLedgerPersistence },
  homeostasisBand: snapshotLedgerRuntime(homeostasisBandLedgerRuntime),
  homeostasisBandPersistence: { ...homeostasisBandLedgerPersistence },
  homeostasisMaxDelta: snapshotLedgerRuntime(homeostasisMaxDeltaLedgerRuntime),
  homeostasisMaxDeltaPersistence: { ...homeostasisMaxDeltaLedgerPersistence },
  homeostasisOverflowThreshold: snapshotLedgerRuntime(
    homeostasisOverflowThresholdLedgerRuntime,
  ),
  homeostasisOverflowThresholdPersistence: {
    ...homeostasisOverflowThresholdLedgerPersistence,
  },
  daemonMaxActions: snapshotLedgerRuntime(daemonMaxActionsLedgerRuntime),
  daemonMaxActionsPersistence: { ...daemonMaxActionsLedgerPersistence },
  federationDegradeEnergyRatio: snapshotLedgerRuntime(
    federationDegradeEnergyRatioLedgerRuntime,
  ),
  federationDegradeEnergyRatioPersistence: {
    ...federationDegradeEnergyRatioLedgerPersistence,
  },
});
const snapshotEvolutionPressureState = (): EvolutionPressureState => ({
  noveltySigned: evolutionPressureState.noveltySigned,
  symbiosisSigned: evolutionPressureState.symbiosisSigned,
  novelty: evolutionPressureState.novelty,
  fear: evolutionPressureState.fear,
  symbiosis: evolutionPressureState.symbiosis,
  ego: evolutionPressureState.ego,
  ring: { ...evolutionPressureState.ring },
});
const snapshotSpatialHashState = (): SpatialHashState => ({
  tick: spatialHashState.tick,
  overflowCount: spatialHashState.overflowCount,
  maxCellCount: spatialHashState.maxCellCount,
  overflowRatio: spatialHashState.overflowRatio,
});
const applyHomeostasisBaseTaxLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("./GENERIC_LEDGER_SYSTEM.ts").LedgerApplyResult<
  "pulse.homeostasis.baseTax"
> => {
  const result = applyLedgerUpdate(homeostasisBaseTaxLedgerRuntime, update);
  homeostasisBaseTaxLedgerRuntime = result.state;
  homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(
    homeostasisBaseTaxLedgerRuntime.currentValue,
  );
  if (result.changed) {
    homeostasisLastUpdateTick = result.state.lastAppliedTick;
    homeostasisLastUpdateSource = result.state.lastAppliedSource;
    homeostasisLastUpdateReason = result.state.lastAppliedReason;
  }
  return result;
};
const rollbackHomeostasisBaseTaxLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("./GENERIC_LEDGER_SYSTEM.ts").LedgerRollbackResult<
  "pulse.homeostasis.baseTax"
> => {
  const result = rollbackLedgerUpdate(
    homeostasisBaseTaxLedgerRuntime,
    rollback,
  );
  homeostasisBaseTaxLedgerRuntime = result.state;
  homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(
    homeostasisBaseTaxLedgerRuntime.currentValue,
  );
  if (result.status === "rolled_back") {
    homeostasisLastUpdateTick = result.state.lastRollbackTick;
    homeostasisLastUpdateSource = result.state.lastRollbackSource;
    homeostasisLastUpdateReason = result.state.lastRollbackReason;
  }
  return result;
};
const syncHomeostasisBaseTaxLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime("pulse.homeostasis.baseTax", {
    initialValue: HOMEOSTASIS_BASE_TAX,
    historyLimit: homeostasisBaseTaxLedgerRuntime.historyLimit,
  });
  homeostasisBaseTaxLedgerRuntime = hydrated.state;
  homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(
    homeostasisBaseTaxLedgerRuntime.currentValue,
  );
  homeostasisBaseTaxLedgerPersistence = hydrated.persistence;
  if (hydrated.snapshot.lastRollbackTick >= 0) {
    homeostasisLastUpdateTick = hydrated.snapshot.lastRollbackTick;
    homeostasisLastUpdateSource = hydrated.snapshot.lastRollbackSource;
    homeostasisLastUpdateReason = hydrated.snapshot.lastRollbackReason;
    return;
  }
  if (hydrated.snapshot.lastAppliedTick >= 0) {
    homeostasisLastUpdateTick = hydrated.snapshot.lastAppliedTick;
    homeostasisLastUpdateSource = hydrated.snapshot.lastAppliedSource;
    homeostasisLastUpdateReason = hydrated.snapshot.lastAppliedReason;
  }
};
const applyHomeostasisTargetEnergyLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("./GENERIC_LEDGER_SYSTEM.ts").LedgerApplyResult<
  "pulse.homeostasis.targetEnergy"
> => {
  const result = applyLedgerUpdate(
    homeostasisTargetEnergyLedgerRuntime,
    update,
  );
  homeostasisTargetEnergyLedgerRuntime = result.state;
  homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyLedgerRuntime.currentValue,
  );
  if (result.changed) {
    homeostasisLastUpdateTick = result.state.lastAppliedTick;
    homeostasisLastUpdateSource = result.state.lastAppliedSource;
    homeostasisLastUpdateReason = result.state.lastAppliedReason;
  }
  return result;
};
const rollbackHomeostasisTargetEnergyLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("./GENERIC_LEDGER_SYSTEM.ts").LedgerRollbackResult<
  "pulse.homeostasis.targetEnergy"
> => {
  const result = rollbackLedgerUpdate(
    homeostasisTargetEnergyLedgerRuntime,
    rollback,
  );
  homeostasisTargetEnergyLedgerRuntime = result.state;
  homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyLedgerRuntime.currentValue,
  );
  if (result.status === "rolled_back") {
    homeostasisLastUpdateTick = result.state.lastRollbackTick;
    homeostasisLastUpdateSource = result.state.lastRollbackSource;
    homeostasisLastUpdateReason = result.state.lastRollbackReason;
  }
  return result;
};
const syncHomeostasisTargetEnergyLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime(
    "pulse.homeostasis.targetEnergy",
    {
      initialValue: HOMEOSTASIS_TARGET_ENERGY,
      historyLimit: homeostasisTargetEnergyLedgerRuntime.historyLimit,
    },
  );
  homeostasisTargetEnergyLedgerRuntime = hydrated.state;
  homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyLedgerRuntime.currentValue,
  );
  homeostasisTargetEnergyLedgerPersistence = hydrated.persistence;
  if (hydrated.snapshot.lastRollbackTick >= 0) {
    homeostasisLastUpdateTick = hydrated.snapshot.lastRollbackTick;
    homeostasisLastUpdateSource = hydrated.snapshot.lastRollbackSource;
    homeostasisLastUpdateReason = hydrated.snapshot.lastRollbackReason;
    return;
  }
  if (hydrated.snapshot.lastAppliedTick >= 0) {
    homeostasisLastUpdateTick = hydrated.snapshot.lastAppliedTick;
    homeostasisLastUpdateSource = hydrated.snapshot.lastAppliedSource;
    homeostasisLastUpdateReason = hydrated.snapshot.lastAppliedReason;
  }
};
const applyPressureRingScaleLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("./GENERIC_LEDGER_SYSTEM.ts").LedgerApplyResult<
  "pulse.pressureRing.scale"
> => {
  const result = applyLedgerUpdate(pressureRingScaleLedgerRuntime, update);
  pressureRingScaleLedgerRuntime = result.state;
  if (result.changed) {
    applyEvolutionPressureRing({
      mode: "set",
      theta: evolutionPressureState.ring.theta,
      scale: result.state.currentValue,
      enabled: evolutionPressureState.ring.enabled,
    });
  }
  return result;
};
const rollbackPressureRingScaleLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("./GENERIC_LEDGER_SYSTEM.ts").LedgerRollbackResult<
  "pulse.pressureRing.scale"
> => {
  const result = rollbackLedgerUpdate(pressureRingScaleLedgerRuntime, rollback);
  pressureRingScaleLedgerRuntime = result.state;
  if (result.status === "rolled_back") {
    applyEvolutionPressureRing({
      mode: "set",
      theta: evolutionPressureState.ring.theta,
      scale: result.state.currentValue,
      enabled: evolutionPressureState.ring.enabled,
    });
  }
  return result;
};
const syncPressureRingScaleLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime("pulse.pressureRing.scale", {
    initialValue: PRESSURE_RING_BASELINE.scale,
    historyLimit: pressureRingScaleLedgerRuntime.historyLimit,
  });
  pressureRingScaleLedgerRuntime = hydrated.state;
  pressureRingScaleLedgerPersistence = hydrated.persistence;
  applyEvolutionPressureRing({
    mode: "set",
    theta: evolutionPressureState.ring.theta,
    scale: pressureRingScaleLedgerRuntime.currentValue,
    enabled: evolutionPressureState.ring.enabled,
  });
};
const syncGenericLedgersHydration = async (): Promise<void> => {
  const bandHyd = await hydrateLedgerRuntime("pulse.homeostasis.band", {
    initialValue: HOMEOSTASIS_BAND,
  });
  homeostasisBandLedgerRuntime = bandHyd.state;
  homeostasisBandLedgerPersistence = bandHyd.persistence;

  const maxDeltaHyd = await hydrateLedgerRuntime("pulse.homeostasis.maxDelta", {
    initialValue: HOMEOSTASIS_MAX_DELTA,
  });
  homeostasisMaxDeltaLedgerRuntime = maxDeltaHyd.state;
  homeostasisMaxDeltaLedgerPersistence = maxDeltaHyd.persistence;

  const overflowHyd = await hydrateLedgerRuntime(
    "pulse.homeostasis.overflowThreshold",
    {
      initialValue: HOMEOSTASIS_OVERFLOW_THRESHOLD,
    },
  );
  homeostasisOverflowThresholdLedgerRuntime = overflowHyd.state;
  homeostasisOverflowThresholdLedgerPersistence = overflowHyd.persistence;

  const daemonHyd = await hydrateLedgerRuntime("daemon.maxActionsPerWindow", {
    initialValue: RUNTIME_POLICY.daemon.maxActionsPerWindow,
  });
  daemonMaxActionsLedgerRuntime = daemonHyd.state;
  daemonMaxActionsLedgerPersistence = daemonHyd.persistence;

  const federationHyd = await hydrateLedgerRuntime(
    "federation.admission.degradeEnergyRatio",
    {
      initialValue: RUNTIME_POLICY.federation.admission.degradeEnergyRatio,
    },
  );
  federationDegradeEnergyRatioLedgerRuntime = federationHyd.state;
  federationDegradeEnergyRatioLedgerPersistence = federationHyd.persistence;
};
const applyEvolutionPressureRing = (
  next: {
    mode: "set" | "step";
    theta?: number;
    deltaTheta?: number;
    scale?: number;
    enabled?: boolean;
  },
): EvolutionPressureState => {
  const prev = snapshotEvolutionPressureState();
  const ringEnabled = next.enabled ?? prev.ring.enabled;
  const baseTheta = prev.ring.theta;
  const requestedTheta = next.mode === "step"
    ? baseTheta + (next.deltaTheta ?? 0)
    : (next.theta ?? baseTheta);
  const requestedScale = next.scale ??
    clampRingScale(pressureRingScaleLedgerRuntime.currentValue);

  if (!ringEnabled) {
    evolutionPressureState = {
      ...BASE_EVOLUTION_PRESSURE_STATE,
      ring: {
        ...prev.ring,
        enabled: false,
        theta: normalizeTheta(requestedTheta),
        scale: clampRingScale(requestedScale),
      },
    };
    return snapshotEvolutionPressureState();
  }

  const derived = deriveRingPressure(requestedTheta, requestedScale);
  evolutionPressureState = {
    noveltySigned: clampPressureTerm(derived.noveltySigned),
    symbiosisSigned: clampPressureTerm(derived.symbiosisSigned),
    novelty: clampPressureTerm(derived.novelty),
    fear: clampPressureTerm(derived.fear),
    symbiosis: clampPressureTerm(derived.symbiosis),
    ego: clampPressureTerm(derived.ego),
    ring: {
      enabled: true,
      theta: derived.ring.theta,
      scale: derived.ring.scale,
      fearCuriosityBalance: derived.ring.fearCuriosityBalance,
      egoLoveBalance: derived.ring.egoLoveBalance,
    },
  };
  return snapshotEvolutionPressureState();
};

const workers: Worker[] = [];
let workerPromises: Promise<any>[] = [];
const workerRecoveryLogAt = new Map<string, number>();

const shouldLogWorkerRecovery = (
  workerIndex: number,
  phase: string,
  timeoutWindows: number,
): boolean => {
  if (timeoutWindows <= 0) return false;
  if (timeoutWindows <= 1 && !WORKER_RECOVERY_VERBOSE) return false;
  if (timeoutWindows > 1) return true;
  const key = `${workerIndex}:${phase}`;
  const now = Date.now();
  const last = workerRecoveryLogAt.get(key) ?? 0;
  if (now - last < WORKER_RECOVERY_LOG_COOLDOWN_MS) return false;
  workerRecoveryLogAt.set(key, now);
  return true;
};

type WorkerFaultStat = {
  workerIndex: number;
  requests: number;
  completed: number;
  timeouts: number;
  retryWaits: number;
  failures: number;
  consecutiveTimeouts: number;
  lastRequestType: string;
  lastPulseId: number;
  lastError: string;
};
const makeWorkerFaultStat = (workerIndex: number): WorkerFaultStat => ({
  workerIndex,
  requests: 0,
  completed: 0,
  timeouts: 0,
  retryWaits: 0,
  failures: 0,
  consecutiveTimeouts: 0,
  lastRequestType: "NONE",
  lastPulseId: -1,
  lastError: "",
});
const workerFaultStats: WorkerFaultStat[] = [];
const getWorkerFaultStat = (workerIndex: number): WorkerFaultStat => {
  if (!workerFaultStats[workerIndex]) {
    workerFaultStats[workerIndex] = makeWorkerFaultStat(workerIndex);
  }
  return workerFaultStats[workerIndex];
};

const idsView = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
const xsView = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
const ysView = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
const energiesView = new Int32Array(
  sharedBuffer,
  OFFSETS.ENERGY_OFFSET,
  MAX_ATOMS,
);
const resonancesView = new Int32Array(
  sharedBuffer,
  OFFSETS.RESONANCE_OFFSET,
  MAX_ATOMS,
);
const causalityView = new Uint8Array(
  sharedBuffer,
  OFFSETS.CAUSALITY_OFFSET,
  MAX_ATOMS,
);
export const phasesView = new Int32Array(
  sharedBuffer,
  OFFSETS.PHASE_OFFSET,
  MAX_ATOMS,
);
export const rolesView = new Uint8Array(
  sharedBuffer,
  OFFSETS.ROLES_OFFSET,
  MAX_ATOMS,
);
export const logicView = new Uint8Array(
  sharedBuffer,
  OFFSETS.LOGIC_OFFSET,
  MAX_ATOMS * 8,
);
const instructionsView = new Uint8Array(
  sharedBuffer,
  OFFSETS.INSTRUCTIONS_OFFSET,
  MAX_ATOMS * 64,
);
const bondsView = new Uint32Array(
  sharedBuffer,
  OFFSETS.BONDS_OFFSET,
  MAX_ATOMS * 4,
);
const readXsView = new Int16Array(
  sharedBuffer,
  OFFSETS.PHYSICS_READ_XS_OFFSET,
  MAX_ATOMS,
);
const readYsView = new Int16Array(
  sharedBuffer,
  OFFSETS.PHYSICS_READ_YS_OFFSET,
  MAX_ATOMS,
);
const readEnergiesView = new Int32Array(
  sharedBuffer,
  OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
  MAX_ATOMS,
);
const readResonancesView = new Int32Array(
  sharedBuffer,
  OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
  MAX_ATOMS,
);
const spawnHeadView = new Int32Array(
  sharedBuffer,
  OFFSETS.SPAWN_REQUESTS_OFFSET,
  2,
);
const spawnDataView = new DataView(
  sharedBuffer,
  OFFSETS.SPAWN_REQUESTS_OFFSET + 8,
  SPAWN_RING_CAPACITY * SPAWN_SLOT_BYTES,
);
const coherenceView = new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1);

// Helper for drift & trend monitoring
class RollingHistory {
  private values: Float64Array;
  private head = 0;
  private count = 0;
  constructor(private maxSize: number) {
    this.values = new Float64Array(maxSize);
  }
  add(val: number) {
    this.values[this.head] = val;
    this.head = (this.head + 1) % this.maxSize;
    if (this.count < this.maxSize) this.count++;
  }
  sum() {
    let s = 0;
    for (let i = 0; i < this.count; i++) s += this.values[i];
    return s;
  }
  size() {
    return this.count || 1;
  }
}

const noveltyHistory = new RollingHistory(100);

const nextPulseId = (): number =>
  Date.now() + Math.floor(Math.random() * 1_000_000);

const driftWarden = new DriftWarden();
const genesisInceptor = new GenesisInceptor();
const lineageTracker = new LineageTracker();
const quorumAdvocate = new QuorumAdvocate();
let shadowForkActive = false;

const guardianPheromoneAllowedByExecutionMode = (idx: number): boolean => {
  return Atomics.load(causalityView, idx) !== 0;
};

const architectPlasmidAllowedByExecutionMode = (idx: number): boolean => {
  return Atomics.load(causalityView, idx) !== 0;
};

const CHILD_ID_SALT = 0x9E3779B97F4A7C15n;
const deriveChildId = (
  tick: number,
  freeIdx: number,
  genomeLo: number,
  genomeHi: number,
  cx: number,
  cy: number,
): bigint => {
  const tickPart = BigInt(tick >>> 0) << 32n;
  const idxPart = BigInt((freeIdx + 1) >>> 0);
  const genomePart = (BigInt(genomeLo >>> 0) << 32n) | BigInt(genomeHi >>> 0);
  const posBits = (((cx & 0xFFFF) << 16) | (cy & 0xFFFF)) >>> 0;
  let id = tickPart ^ genomePart ^ (BigInt(posBits) << 8n) ^ idxPart ^
    CHILD_ID_SALT;
  if (id === 0n) id = idxPart;
  return id === 0n ? 1n : id;
};
const findNextFreeSlot = (startIdx: number): number => {
  for (let i = startIdx; i < MAX_ATOMS; i++) {
    if (Atomics.load(idsView, i) === 0n) return i;
  }
  return -1;
};
const genomeKey16 = (idx: number): number => {
  const off = idx * 8;
  return ((logicView[off] << 8) | logicView[off + 1]) >>> 0;
};
const hasGenomeResidue = (idx: number): boolean => {
  const off = idx * 8;
  for (let i = 0; i < 8; i++) {
    if (logicView[off + i] !== 0) return true;
  }
  return false;
};
const applyEvolutionPressureTerms = (
  tick: number,
  activeIdx: number[],
): {
  adjusted: number;
  noveltyDeltaRaw: number;
  symbiosisDeltaRaw: number;
} => {
  const pressureState = snapshotEvolutionPressureState();
  const noveltySigned = pressureState.noveltySigned;
  const symbiosisSigned = pressureState.symbiosisSigned;
  if (
    (noveltySigned === 0 && symbiosisSigned === 0) ||
    activeIdx.length === 0
  ) {
    return { adjusted: 0, noveltyDeltaRaw: 0, symbiosisDeltaRaw: 0 };
  }
  const population = activeIdx.length;
  const genomeCounts = new Map<number, number>();
  for (const idx of activeIdx) {
    const key = genomeKey16(idx);
    genomeCounts.set(key, (genomeCounts.get(key) ?? 0) + 1);
  }

  let adjusted = 0;
  let noveltyDeltaRaw = 0;
  let symbiosisDeltaRaw = 0;

  for (const idx of activeIdx) {
    const key = genomeKey16(idx);
    const sameGenomeCount = genomeCounts.get(key) ?? 1;

    let noveltyTerm = 0;
    if (noveltySigned !== 0) {
      noveltyTerm = Math.trunc(
        (noveltySigned * (population - (sameGenomeCount * 2))) / population,
      );
    }

    let symbiosisTerm = 0;
    if (symbiosisSigned !== 0) {
      const base = idx * 4;
      let crossGenomeBonds = 0;
      for (let slot = 0; slot < 4; slot++) {
        const target = Atomics.load(bondsView, base + slot);
        if (target <= 0 || target >= MAX_ATOMS) continue;
        if (Atomics.load(idsView, target) === 0n) continue;
        if (genomeKey16(target) !== key) crossGenomeBonds++;
      }
      const bondPolarity = symbiosisSigned >= 0 ? 1 : -1;
      symbiosisTerm = crossGenomeBonds > 0
        ? symbiosisSigned * crossGenomeBonds
        : bondPolarity * -symbiosisSigned;
    }

    const delta = noveltyTerm + symbiosisTerm;
    noveltyDeltaRaw += noveltyTerm;
    symbiosisDeltaRaw += symbiosisTerm;
    if (delta === 0) continue;

    const current = Atomics.load(energiesView, idx);
    const next = Math.max(0, current + delta);
    if (next !== current) {
      Atomics.store(energiesView, idx, next);
      adjusted++;
    }
  }

  // Update history for drift monitoring
  noveltyHistory.add(noveltyDeltaRaw);

  if (adjusted > 0) {
    MUTATION_TELEMETRY.record({
      lane: "internal_host",
      kind: "evolution_pressure_adjust",
      count: adjusted,
    });
    if (tick % 200 === 0) {
      LOGGER.info(
        `🧭 [EVOLUTION] pressure adjusted=${adjusted} noveltyRaw=${noveltyDeltaRaw} symbiosisRaw=${symbiosisDeltaRaw} pN=${pressureState.noveltySigned} pS=${pressureState.symbiosisSigned} fear=${pressureState.fear} ego=${pressureState.ego}`,
      );
    }
  }

  return { adjusted, noveltyDeltaRaw, symbiosisDeltaRaw };
};

const applyEnergyHomeostasisTerms = (
  tick: number,
  activeIdx: number[],
  spatialOverflowRatio: number,
): { adjusted: number; netDelta: number } => {
  if (!HOMEOSTASIS_ENABLED || activeIdx.length === 0) {
    return { adjusted: 0, netDelta: 0 };
  }
  const bandStep = Math.max(1, Math.floor(HOMEOSTASIS_BAND / 2));
  const overflowActive = spatialOverflowRatio >= HOMEOSTASIS_OVERFLOW_THRESHOLD;
  const baseTax = clampHomeostasisBaseTax(homeostasisBaseTaxRuntime);
  const targetEnergy = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyRuntime,
  );
  let adjusted = 0;
  let netDelta = 0;
  let taxed = 0;
  let subsidized = 0;

  for (const idx of activeIdx) {
    const current = Atomics.load(energiesView, idx);
    if (current <= 0) continue;
    let delta = 0;

    if (baseTax > 0 && current > HOMEOSTASIS_STARVATION_FLOOR) {
      const tax = Math.min(baseTax, current);
      delta -= tax;
      taxed += tax;
    }

    const deviation = current - targetEnergy;
    const absDeviation = Math.abs(deviation);
    if (absDeviation > HOMEOSTASIS_BAND) {
      const gradient = absDeviation - HOMEOSTASIS_BAND;
      const step = Math.min(
        HOMEOSTASIS_MAX_DELTA,
        1 + Math.floor(gradient / bandStep),
      );

      if (deviation > 0) {
        delta -= step;
        taxed += step;
        if (overflowActive) {
          delta -= 1;
          taxed += 1;
        }
      } else if (HOMEOSTASIS_SUBSIDY_ENABLED) {
        let subsidy = step;
        if (overflowActive) {
          subsidy = Math.max(1, Math.floor(subsidy * 0.6));
        }
        delta += subsidy;
        subsidized += subsidy;
      }
    }

    if (current <= HOMEOSTASIS_STARVATION_FLOOR && delta < 0) {
      delta = 0;
    }
    if (delta === 0) continue;

    const next = Math.max(0, current + delta);
    if (next !== current) {
      Atomics.store(energiesView, idx, next);
      adjusted++;
      netDelta += next - current;
    }
  }

  if (adjusted > 0) {
    MUTATION_TELEMETRY.record({
      lane: "internal_host",
      kind: "energy_homeostasis_adjust",
      count: adjusted,
    });
    if (tick % 20 === 0) {
      LOGGER.debug(
        `⚖️ [HOMEOSTASIS] adjusted=${adjusted} netDelta=${netDelta} tax=${taxed} subsidy=${subsidized} target=${targetEnergy} band=${HOMEOSTASIS_BAND} baseTax=${baseTax} subsidyEnabled=${HOMEOSTASIS_SUBSIDY_ENABLED} overflow=${
          spatialOverflowRatio.toFixed(3)
        }`,
      );
    }
  }
  return { adjusted, netDelta };
};

type WasmPreflightReport = {
  ok: boolean;
  bytes: number;
  reason: string;
};
const wasmPreflight = async (): Promise<WasmPreflightReport> => {
  if (FORCE_WASM_PREFLIGHT_FAIL) {
    return {
      ok: false,
      bytes: 0,
      reason: "FORCED_WASM_PREFLIGHT_FAIL",
    };
  }
  try {
    const bytes = await Deno.readFile(WASM_RELEASE_URL);
    if (bytes.byteLength <= 0) {
      return { ok: false, bytes: 0, reason: "EMPTY_WASM_ARTIFACT" };
    }
    await WebAssembly.compile(bytes);
    return { ok: true, bytes: bytes.byteLength, reason: "" };
  } catch (err) {
    const reason = err instanceof Error
      ? `${err.name}: ${err.message}`
      : String(err);
    return { ok: false, bytes: 0, reason };
  }
};
const enterWasmSafeNoopMode = (reason: string): void => {
  wasmBootDegraded = true;
  wasmBootReason = reason;
  runtimeWorkerCount = 0;
  terminateWorkersInternal(false);
};

type WorkerWaitResult<T> = {
  data: T;
  timeoutWindows: number;
  retriesUsed: number;
};
class WorkerTimeoutError extends Error {
  timeoutWindows: number;
  expectedType: string;
  expectedPulseId?: number;

  constructor(
    expectedType: string,
    expectedPulseId: number | undefined,
    timeoutWindows: number,
  ) {
    super(
      `[PULSE] Worker timeout waiting for ${expectedType} (pulseId=${
        expectedPulseId ?? "n/a"
      }, windows=${timeoutWindows})`,
    );
    this.name = "WorkerTimeoutError";
    this.timeoutWindows = timeoutWindows;
    this.expectedType = expectedType;
    this.expectedPulseId = expectedPulseId;
  }
}

const waitForWorkerMessage = <T = any>(
  worker: Worker,
  expectedType: string,
  expectedPulseId?: number,
  timeoutMs: number = WORKER_RESPONSE_TIMEOUT_MS,
): Promise<WorkerWaitResult<T>> => {
  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let remainingRetries = WORKER_TIMEOUT_RETRY_COUNT;
    let timeoutWindows = 0;

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      worker.removeEventListener("message", listener);
    };

    const armTimeout = (ms: number) => {
      timeoutId = setTimeout(() => {
        timeoutWindows++;
        if (remainingRetries > 0) {
          remainingRetries--;
          armTimeout(WORKER_TIMEOUT_RETRY_MS);
          return;
        }
        cleanup();
        reject(
          new WorkerTimeoutError(expectedType, expectedPulseId, timeoutWindows),
        );
      }, ms);
    };

    const listener = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.type !== expectedType) return;
      if (expectedPulseId !== undefined && data.pulseId !== expectedPulseId) {
        return;
      }
      const retriesUsed = timeoutWindows > 0
        ? Math.min(timeoutWindows, WORKER_TIMEOUT_RETRY_COUNT)
        : 0;
      cleanup();
      resolve({ data: data as T, timeoutWindows, retriesUsed });
    };
    worker.addEventListener("message", listener);
    armTimeout(timeoutMs);
  });
};

const waitForWorkerInit = (
  worker: Worker,
  workerIndex: number,
  timeoutMs: number = WORKER_RESPONSE_TIMEOUT_MS,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let remainingRetries = WORKER_TIMEOUT_RETRY_COUNT;
    let timeoutWindows = 0;

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      worker.removeEventListener("message", listener);
    };

    const armTimeout = (ms: number) => {
      timeoutId = setTimeout(() => {
        timeoutWindows++;
        if (remainingRetries > 0) {
          remainingRetries--;
          armTimeout(WORKER_TIMEOUT_RETRY_MS);
          return;
        }
        cleanup();
        reject(
          new Error(
            `[PULSE] Worker-${workerIndex} init timeout waiting for READY (windows=${timeoutWindows}).`,
          ),
        );
      }, ms);
    };

    const listener = (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;
      if (data.type === "READY") {
        cleanup();
        if (shouldLogWorkerRecovery(workerIndex, "READY", timeoutWindows)) {
          LOGGER.warn(
            `   [PULSE] Worker-${workerIndex} recovered READY after ${timeoutWindows} timeout window(s).`,
          );
        }
        resolve();
        return;
      }
      if (data.type === "INIT_FAILED") {
        cleanup();
        const errMsg = typeof data.error === "string"
          ? data.error
          : "unknown init failure";
        reject(
          new Error(`[PULSE] Worker-${workerIndex} init failed: ${errMsg}`),
        );
      }
    };

    worker.addEventListener("message", listener);
    armTimeout(timeoutMs);
  });
};

const postAndWait = async <T = any>(
  workerIndex: number,
  worker: Worker,
  message: Record<string, unknown>,
  expectedType: string,
  timeoutMs?: number,
): Promise<T> => {
  const stats = getWorkerFaultStat(workerIndex);
  const pulseId = typeof message.pulseId === "number"
    ? message.pulseId
    : undefined;
  stats.requests++;
  stats.lastRequestType = expectedType;
  stats.lastPulseId = pulseId ?? -1;
  const pending = waitForWorkerMessage<T>(
    worker,
    expectedType,
    pulseId,
    timeoutMs,
  );
  worker.postMessage(message);
  try {
    const res = await pending;
    if (res.timeoutWindows > 0) {
      stats.timeouts += res.timeoutWindows;
      stats.retryWaits += res.retriesUsed;
      if (
        shouldLogWorkerRecovery(
          workerIndex,
          expectedType,
          res.timeoutWindows,
        )
      ) {
        LOGGER.warn(
          `   [PULSE] Worker-${workerIndex} recovered ${expectedType} after ${res.timeoutWindows} timeout window(s).`,
        );
      }
    }
    stats.completed++;
    stats.consecutiveTimeouts = 0;
    stats.lastError = "";
    return res.data;
  } catch (err) {
    if (err instanceof WorkerTimeoutError) {
      stats.timeouts += err.timeoutWindows;
      stats.retryWaits += Math.max(0, err.timeoutWindows - 1);
    }
    stats.failures++;
    stats.consecutiveTimeouts++;
    stats.lastError = err instanceof Error ? err.message : String(err);
    throw err;
  }
};

const dispatchRangePhase = async (
  type: "PULSE" | "REDUCE_DELTAS",
  doneType: "DONE" | "DELTA_DONE",
): Promise<void> => {
  workerPromises = [];
  if (STRICT_DETERMINISM && runtimeWorkerCount > 1) {
    const pulseId = nextPulseId();
    workerPromises.push(postAndWait(
      0,
      workers[0],
      {
        type,
        startIdx: 0,
        endIdx: MAX_ATOMS,
        pulseId,
        theta: evolutionPressureState.ring.theta,
      },
      doneType,
    ));
  } else {
    const chunkSize = Math.ceil(MAX_ATOMS / runtimeWorkerCount);
    for (let i = 0; i < runtimeWorkerCount; i++) {
      const startIdx = i * chunkSize;
      const endIdx = i === runtimeWorkerCount - 1
        ? MAX_ATOMS
        : Math.min(MAX_ATOMS, (i + 1) * chunkSize);

      const pulseId = nextPulseId();
      workerPromises.push(postAndWait(
        i,
        workers[i],
        {
          type,
          startIdx,
          endIdx,
          pulseId,
          theta: evolutionPressureState.ring.theta,
        },
        doneType,
      ));
    }
  }
  await Promise.all(workerPromises);
};
const startWorkers = async (count: number): Promise<void> => {
  workerFaultStats.length = 0;
  workerPromises = [];
  for (let i = 0; i < count; i++) {
    const worker = new Worker(
      new URL("./PULSE_WORKER.ts", import.meta.url).href,
      { type: "module" },
    );

    worker.addEventListener("message", (e) => {
      const data = e.data;
      if (data && data.type === "SPORE_DRIVE_REQUEST") {
        const idx = data.atomIdx;
        const atomIdAtStart = STATE_MATRIX.getId(idx);
        if (atomIdAtStart !== 0n) {
          // Immediately pack and schedule for migration to clear memory bounds
          const packedAtom = P2P_CODEC.packAtom(idx);
          if (packedAtom) {
            NEXUS_DAEMON.routeAtom(packedAtom);
            LOGGER.debug(
              `🛸 [PULSE] Spore Drive invoked: atom ${atomIdAtStart} routed to Nexus. Recycling locally.`,
            );
            STATE_MATRIX.recycleAtom(idx);
          } else {
            LOGGER.error(`[PULSE] Failed to pack atom ${atomIdAtStart} for transit`);
          }
        }
      }
    });

    workers.push(worker);
    workerFaultStats.push(makeWorkerFaultStat(i));

    const p = waitForWorkerInit(worker, i);
    worker.postMessage({
      type: "INIT",
      wasmMemory: STATE_MATRIX.wasmMemory,
      buffer: STATE_MATRIX.buffer,
      marketBuffer: PREDICTION_MARKET.buffer,
      workerIndex: i,
    });
    workerPromises.push(p.then(() => undefined));
  }
  await Promise.all(workerPromises);
};
const terminateWorkersInternal = (resetStartupSelfTestState: boolean): void => {
  for (const worker of workers) {
    worker.terminate();
  }
  workers.length = 0;
  workerPromises = [];
  workerFaultStats.length = 0;
  if (resetStartupSelfTestState && !startupSelfTestInProgress) {
    resetStartupSelfTestStateForColdStart();
  }
};
const startWorkersWithInitFallback = async (count: number): Promise<void> => {
  try {
    await startWorkers(count);
  } catch (err) {
    terminateWorkersInternal(false);
    const primaryErr = err instanceof Error ? err.message : String(err);

    if (!WORKER_INIT_FALLBACK_ENABLED || count <= 1) {
      pulseInitialized = true;

      LOGGER.info(`[PULSE] System initialization complete.`);
      runtimeWorkerCount = 0;
      const failMsg = `[PULSE] Worker init failed: ${primaryErr}`;
      if (WASM_BOOT_POLICY === "safe-noop") {
        LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
        enterWasmSafeNoopMode(failMsg);
        return;
      }
      throw new Error(failMsg);
    }

    runtimeWorkerCount = 1;
    initFallbackActivated = true;
    initFallbackReason = primaryErr;
    LOGGER.warn(
      `   [PULSE] Worker init failed; fallback to single worker. reason=${primaryErr}`,
    );

    try {
      await startWorkers(runtimeWorkerCount);
    } catch (fallbackErr) {
      terminateWorkersInternal(false);
      const fallbackMsg = fallbackErr instanceof Error
        ? fallbackErr.message
        : String(fallbackErr);
      runtimeWorkerCount = 0;
      const failMsg =
        `[PULSE] Worker init fallback failed: primary=${primaryErr}; fallback=${fallbackMsg}`;
      if (WASM_BOOT_POLICY === "safe-noop") {
        LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
        enterWasmSafeNoopMode(failMsg);
        return;
      }
      throw new Error(failMsg);
    }
  }
};
const startupSelfTestBreached = (): boolean => {
  if (Atomics.load(idsView, 0) !== 0n) return true;
  return STATE_MATRIX.getActiveIndices().length !== 0;
};

export interface DriftMetrics {
  energyDiff: number;
  resonanceDiff: number;
  bondsBroken: number;
  bondsFormed: number;
  structuralValueChange: number;
  populationDiff: number;
  coherenceDiff: number;
  divergenceTick: number;
}

// Global reference for oracle side-channel
let shadowWasmInstance: WebAssembly.Instance | null = null;
let run_shadow_simulation_ffi:
  | ((
    atomId: number,
    ticks: number,
    logicPtr: number,
    resultPtr: number,
  ) => number)
  | null = null;
let generate_epoch_proof_ffi:
  | ((
    tick: number,
    resultPtr: number,
  ) => void)
  | null = null;

async function initShadowWasm(): Promise<void> {
  if (shadowWasmInstance) return;
  const wasmBytes = await Deno.readFile(
    new URL(
      "./sigma_core/target/wasm32-unknown-unknown/release/sigma_core.wasm",
      import.meta.url,
    ),
  );

  const instantiated = await WebAssembly.instantiate(wasmBytes, {
    env: {
      memory: STATE_MATRIX.wasmMemory,
      abort: (msg: any) => LOGGER.error("   [SHADOW WASM ABORT]:", msg),
      // Dummy trace_atom for shadow
      trace_atom: () => {},
    },
  });

  shadowWasmInstance = instantiated.instance;
  run_shadow_simulation_ffi = shadowWasmInstance.exports
    .run_shadow_simulation_ffi as any;
  generate_epoch_proof_ffi = shadowWasmInstance.exports
    .generate_epoch_proof_ffi as any;
}

let pulseInitialized = false;
let lastEgressReadHead = 0;

export const drainEgressEvents = (): Uint8Array[] => {
  const headView = new Int32Array(
    STATE_MATRIX.wasmMemory.buffer,
    OFFSETS.EGRESS_HEAD_OFFSET,
    1,
  );
  const writeHead = Atomics.load(headView, 0);
  const readHead = lastEgressReadHead || 0;

  if (writeHead === readHead) return [];

  const events: Uint8Array[] = [];
  const maxEvents = OFFSETS.MAX_EGRESS_EVENTS;
  const dataView = new Uint8Array(
    STATE_MATRIX.wasmMemory.buffer,
    OFFSETS.EGRESS_DATA_OFFSET,
    maxEvents * 256,
  );

  const count = Math.min(writeHead - readHead, maxEvents);
  const startIdx = readHead % maxEvents;

  for (let i = 0; i < count; i++) {
    const idx = (startIdx + i) % maxEvents;
    const offset = idx * 256;
    // Copy the array out of WASM memory because WASM memory might mutate over time
    events.push(new Uint8Array(dataView.slice(offset, offset + 256)));
  }

  lastEgressReadHead = writeHead;
  return events;
};

export const PULSE = {
  get initialized() {
    return pulseInitialized;
  },
  set initialized(val: boolean) {
    pulseInitialized = val;
  },
  currentPulseId: Date.now(),
  getStats: () => ({
    // Placeholder for actual stats implementation
    workerFaultStats: workerFaultStats.map((s) => ({ ...s })),
    runtimeWorkerCount,
    startupSelfTestDone,
    startupSelfTestInProgress,
    startupSelfTestFallbackActivated,
    startupSelfTestLastBreachTick,
    initFallbackActivated,
    initFallbackReason,
    wasmBootDegraded,
    wasmBootReason,
    wasmBootArtifactBytes,
    wasmBootPrecheckCompleted,
  }),
  generateEpochProof: async (tick: number): Promise<string> => {
    if (!shadowWasmInstance || !generate_epoch_proof_ffi) {
      await initShadowWasm();
    }
    const resultPtr = OFFSETS.LATTICE_MEMORY_END + 1024 + 128;
    generate_epoch_proof_ffi!(tick, resultPtr);

    const u8View = new Uint8Array(
      STATE_MATRIX.wasmMemory.buffer,
      resultPtr,
      32,
    );
    return Array.from(u8View).map((b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
  },
  simulateFuture: async (
    steps: number,
    targetIdx: number,
    bytecode: Uint8Array,
  ): Promise<DriftMetrics> => {
    if (!shadowWasmInstance || !run_shadow_simulation_ffi) {
      await initShadowWasm();
    }

    // We need 64 bytes for the hallucinated bytecode, and 32 bytes for the metrics result.
    // We will place this safely past the LATTICE_MEMORY_END to avoid collisions,
    // ensuring we fit inside the initial 163MB memory bounds without triggering out of bounds RangeErrors.
    const scratchSpaceOffset = OFFSETS.LATTICE_MEMORY_END + 1024;
    const resultPtr = scratchSpaceOffset + 64;

    // Write logic bytes
    const u8View = new Uint8Array(STATE_MATRIX.wasmMemory.buffer);
    u8View.fill(0, scratchSpaceOffset, scratchSpaceOffset + 64);
    u8View.set(bytecode, scratchSpaceOffset);

    // Clear result space
    const i32View = new Int32Array(
      STATE_MATRIX.wasmMemory.buffer,
      resultPtr,
      8,
    );
    i32View.fill(0);

    const atomId = Number(STATE_MATRIX.getId(targetIdx));

    // Call Rust side
    const success = run_shadow_simulation_ffi!(
      atomId,
      steps,
      scratchSpaceOffset,
      resultPtr,
    );

    if (success !== 1) {
      throw new Error(
        `[SHADOW] Simulation execution failed for target ${atomId}`,
      );
    }

    return {
      energyDiff: i32View[0],
      resonanceDiff: i32View[1],
      bondsBroken: i32View[2],
      bondsFormed: i32View[3],
      structuralValueChange: i32View[4],
      populationDiff: i32View[5],
      coherenceDiff: i32View[6],
      divergenceTick: i32View[7],
    };
  },
  initWorkers: async (requestedWorkerCount?: number) => {
    if (workers.length > 0) return;
    resetStartupSelfTestStateForColdStart();
    resetEvolutionPressureStateForColdStart();
    resetHomeostasisStateForColdStart();
    await syncHomeostasisBaseTaxLedgerHydration();
    await syncHomeostasisTargetEnergyLedgerHydration();
    await syncPressureRingScaleLedgerHydration();
    const pressureState = snapshotEvolutionPressureState();
    runtimeWorkerCount = requestedWorkerCount === undefined
      ? WORKER_COUNT
      : Math.max(1, Math.min(32, Math.floor(requestedWorkerCount)));
    if (RUNTIME_POLICY.pulse.source.workerCount) {
      LOGGER.info(
        `   [PULSE] Worker override: OMEGA_PULSE_WORKERS=${runtimeWorkerCount}`,
      );
    }
    if (STRICT_DETERMINISM && runtimeWorkerCount > 1) {
      LOGGER.info(
        "   [PULSE] OMEGA_STRICT_DETERMINISM=1 -> serial execute on worker-0.",
      );
    }
    if (RUNTIME_POLICY.pulse.source.workerResponseTimeoutMs) {
      LOGGER.info(
        `   [PULSE] Worker timeout config: timeout=${WORKER_RESPONSE_TIMEOUT_MS}ms, retryCount=${WORKER_TIMEOUT_RETRY_COUNT}, retryMs=${WORKER_TIMEOUT_RETRY_MS}`,
      );
    }
    if (RUNTIME_POLICY.pulse.source.workerInitFallback) {
      LOGGER.info(
        `   [PULSE] Worker init fallback enabled=${WORKER_INIT_FALLBACK_ENABLED}.`,
      );
    }
    if (RUNTIME_POLICY.pulse.source.wasmBootPolicy) {
      LOGGER.info(`   [PULSE] WASM boot policy=${WASM_BOOT_POLICY}.`);
    }
    if (RUNTIME_POLICY.pulse.source.wasmBootPrecheck) {
      LOGGER.info(
        `   [PULSE] WASM precheck enabled=${WASM_BOOT_PRECHECK_ENABLED}.`,
      );
    }
    if (
      RUNTIME_POLICY.pulse.source.noveltyPressure ||
      RUNTIME_POLICY.pulse.source.symbiosisPressure ||
      RUNTIME_POLICY.pulse.source.matrixTheta ||
      RUNTIME_POLICY.pulse.source.pressureRingScale ||
      pressureState.noveltySigned !== 0 ||
      pressureState.symbiosisSigned !== 0 ||
      pressureState.fear > 0 ||
      pressureState.ego > 0
    ) {
      LOGGER.info(
        `   [PULSE] Evolution pressure terms novelty=${pressureState.noveltySigned} symbiosis=${pressureState.symbiosisSigned} fear=${pressureState.fear} ego=${pressureState.ego} ring=${pressureState.ring.enabled} theta=${
          pressureState.ring.theta.toFixed(4)
        } scale=${pressureState.ring.scale}.`,
      );
    }
    if (
      STARTUP_SELFTEST_ENABLED && runtimeWorkerCount > 1 &&
      RUNTIME_POLICY.pulse.source.startupSelfTest
    ) {
      LOGGER.info(
        `   [PULSE] Startup self-test enabled: ticks=${STARTUP_SELFTEST_TICKS}, fallback=${STARTUP_SELFTEST_FALLBACK_ENABLED}`,
      );
    }

    if (WASM_BOOT_PRECHECK_ENABLED) {
      const preflight = await wasmPreflight();
      wasmBootPrecheckCompleted = true;
      wasmBootArtifactBytes = preflight.bytes;
      if (!preflight.ok) {
        const failMsg = `[PULSE] WASM preflight failed: ${preflight.reason}`;
        if (WASM_BOOT_POLICY === "safe-noop") {
          LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
          enterWasmSafeNoopMode(failMsg);
          return;
        }
        throw new Error(failMsg);
      }
    }

    await startWorkersWithInitFallback(runtimeWorkerCount);
    if (wasmBootDegraded) return;

    if (initFallbackActivated) {
      LOGGER.warn(
        `   [PULSE] ${runtimeWorkerCount} Worker READY after init fallback.`,
      );
    } else {
      LOGGER.info(
        `   [PULSE] ${runtimeWorkerCount} Parallel Workers READY with WASM VMs.`,
      );
    }

    if (
      !startupSelfTestDone && !startupSelfTestInProgress &&
      STARTUP_SELFTEST_ENABLED && runtimeWorkerCount > 1
    ) {
      await PULSE.runStartupSelfTest();
    }

    // Always start the network layer before bootstrapping bounds
    NEXUS_DAEMON.mainnetEnabled = RUNTIME_POLICY.p2p.mainnetEnabled;
    NEXUS_DAEMON.bootstrapHubUrl = RUNTIME_POLICY.p2p.bootstrapHubUrl;
    await NEXUS_DAEMON.start();

    // Phase 30 / Phase 36: Bootstrapping Node Payload
    if (
      STATE_MATRIX.getActiveIndices().length === 0 &&
      (NEXUS_DAEMON.seedNodes.length > 0 || NEXUS_DAEMON.mainnetEnabled)
    ) {
      LOGGER.info(
        `[PULSE] Matrix is uninstantiated. Awaiting Swarm Handshake...`,
      );
      await new Promise((r) => setTimeout(r, 600)); // allow sockets to open

      LOGGER.info(`[PULSE] Requesting Genesis Block via Nexus...`);
      await new Promise<void>((resolve) => {
        genesisPromiseResolver = resolve;
        NEXUS_DAEMON.broadcastSyncRequest();
      });
      LOGGER.info(
        `[PULSE] Genesis Bootstrapping complete! Synchronized to Swarm Lattice.`,
      );
    }
  },
  runStartupSelfTest: async () => {
    if (
      startupSelfTestDone || startupSelfTestInProgress ||
      !STARTUP_SELFTEST_ENABLED
    ) return;
    if (workers.length === 0 || runtimeWorkerCount <= 1) {
      startupSelfTestDone = true;
      return;
    }
    if (STATE_MATRIX.getActiveIndices().length !== 0) {
      // Do not mutate populated worlds; this gate is for cold-start only.
      startupSelfTestDone = true;
      return;
    }

    const { tickCounter, syncState, SYNC } = STATE_MATRIX;
    const originalTick = Atomics.load(tickCounter, 0);
    const baseLevel = LOGGER.getLevel();
    startupSelfTestInProgress = true;
    startupSelfTestLastBreachTick = -1;

    if (
      STARTUP_SELFTEST_QUIET &&
      (baseLevel === "debug" || baseLevel === "info")
    ) {
      LOGGER.setLevel("warn");
    }

    try {
      for (let t = 0; t < STARTUP_SELFTEST_TICKS; t++) {
        await PULSE.tick();
        if (STARTUP_SELFTEST_FORCE_BREACH && t === 0) {
          Atomics.store(idsView, 0, 1n);
        }
        if (startupSelfTestBreached()) {
          startupSelfTestLastBreachTick = t;
          break;
        }
      }

      if (startupSelfTestLastBreachTick === -1) {
        startupSelfTestDone = true;
        return;
      }

      LOGGER.warn(
        `   [PULSE] Startup self-test breach at tick=${startupSelfTestLastBreachTick} workers=${runtimeWorkerCount}.`,
      );
      if (!STARTUP_SELFTEST_FALLBACK_ENABLED || runtimeWorkerCount <= 1) {
        throw new Error(
          "[PULSE] Startup self-test failed and fallback is disabled.",
        );
      }

      if (!startupSelfTestFallbackActivated) {
        pulseInitialized = true;
      }
      startupSelfTestFallbackActivated = true;
      PULSE.stopWorkers();
      runtimeWorkerCount = 1;
      await startWorkers(runtimeWorkerCount);
      LOGGER.warn(
        "   [PULSE] Startup self-test fallback activated: forcing single-worker mode.",
      );

      STATE_MATRIX.clear();
      Atomics.store(tickCounter, 0, 0);
      for (let t = 0; t < STARTUP_SELFTEST_TICKS; t++) {
        await PULSE.tick();
        if (startupSelfTestBreached()) {
          throw new Error(
            `[PULSE] Startup self-test failed after fallback (tick=${t}).`,
          );
        }
      }

      startupSelfTestDone = true;
    } finally {
      LOGGER.setLevel(baseLevel);
      STATE_MATRIX.clear();
      Atomics.store(tickCounter, 0, originalTick);
      Atomics.store(syncState, 0, SYNC.IDLE);
      Atomics.notify(syncState, 0);
      startupSelfTestInProgress = false;
    }
  },
  startWorkers: async (count: number) => {
    await startWorkers(count);
  },
  stopWorkers: () => {
    terminateWorkersInternal(true);
  },
  getRuntimeWorkerCount: (): number => runtimeWorkerCount,
  getStartupSelfTestStatus: () => ({
    enabled: STARTUP_SELFTEST_ENABLED,
    ticks: STARTUP_SELFTEST_TICKS,
    done: startupSelfTestDone,
    inProgress: startupSelfTestInProgress,
    fallbackEnabled: STARTUP_SELFTEST_FALLBACK_ENABLED,
    fallbackActivated: startupSelfTestFallbackActivated,
    lastBreachTick: startupSelfTestLastBreachTick,
    initFallbackEnabled: WORKER_INIT_FALLBACK_ENABLED,
    initFallbackActivated,
    initFallbackReason,
    wasmBootPolicy: WASM_BOOT_POLICY,
    wasmBootPrecheckEnabled: WASM_BOOT_PRECHECK_ENABLED,
    wasmBootPrecheckCompleted,
    wasmBootArtifactBytes,
    wasmBootDegraded,
    wasmBootReason,
  }),
  getWorkerFaultStats: (): WorkerFaultStat[] =>
    workerFaultStats.map((stat) => ({ ...stat })),
  setWorkerDebugDelay: async (delayMs: number): Promise<void> => {
    if (workers.length === 0) return;
    const boundedDelay = Math.max(0, Math.min(2000, Math.floor(delayMs)));
    const updates: Promise<any>[] = [];
    for (let i = 0; i < workers.length; i++) {
      const pulseId = nextPulseId();
      updates.push(postAndWait(
        i,
        workers[i],
        { type: "SET_DEBUG_DELAY", delayMs: boundedDelay, pulseId },
        "DEBUG_DELAY_SET",
        Math.max(1_000, WORKER_RESPONSE_TIMEOUT_MS),
      ));
    }
    await Promise.all(updates);
  },
  setWorkerDebugJitter: async (minMs: number, maxMs: number): Promise<void> => {
    if (workers.length === 0) return;
    const boundedMin = Math.max(0, Math.min(2000, Math.floor(minMs)));
    const boundedMax = Math.max(0, Math.min(2000, Math.floor(maxMs)));
    const updates: Promise<any>[] = [];
    for (let i = 0; i < workers.length; i++) {
      const pulseId = nextPulseId();
      updates.push(postAndWait(
        i,
        workers[i],
        {
          type: "SET_DEBUG_JITTER",
          minMs: boundedMin,
          maxMs: boundedMax,
          pulseId,
        },
        "DEBUG_JITTER_SET",
        Math.max(1_000, WORKER_RESPONSE_TIMEOUT_MS),
      ));
    }
    await Promise.all(updates);
  },
  getEvolutionPressureState: (): EvolutionPressureState =>
    snapshotEvolutionPressureState(),
  getSpatialHashState: (): SpatialHashState => snapshotSpatialHashState(),
  getGuardianSignalHybridState: (): GuardianSignalHybridState =>
    snapshotGuardianSignalHybridState(),
  getArchitectPlasmidHybridState: (): ArchitectPlasmidHybridState =>
    snapshotArchitectPlasmidHybridState(),
  getReplicationHybridState: (): ReplicationHybridState =>
    snapshotReplicationHybridState(),
  getGeneticLedgerState: (): GeneticLedgerRuntimeState =>
    snapshotGeneticLedgerRuntimeState(),
  hydrateGeneticLedgerRuntime: async (): Promise<GeneticLedgerRuntimeState> => {
    await syncHomeostasisBaseTaxLedgerHydration();
    await syncHomeostasisTargetEnergyLedgerHydration();
    await syncPressureRingScaleLedgerHydration();
    return snapshotGeneticLedgerRuntimeState();
  },
  applyGeneticLedgerUpdate: async (
    update: {
      key:
        | "pulse.homeostasis.baseTax"
        | "pulse.homeostasis.targetEnergy"
        | "pulse.pressureRing.scale";
      value: number;
      source?: string;
      reason?: string;
      tick?: number;
    },
  ): Promise<
    | import("./GENERIC_LEDGER_SYSTEM.ts").LedgerApplyResult<
      "pulse.homeostasis.baseTax"
    >
    | import("./GENERIC_LEDGER_SYSTEM.ts").LedgerApplyResult<
      "pulse.homeostasis.targetEnergy"
    >
    | import("./GENERIC_LEDGER_SYSTEM.ts").LedgerApplyResult<
      "pulse.pressureRing.scale"
    >
  > => {
    if (update.key === "pulse.pressureRing.scale") {
      const result = applyPressureRingScaleLedgerUpdate({
        value: update.value,
        source: update.source,
        reason: update.reason,
        tick: update.tick,
      });
      if (result.changed) {
        if (result.mutation) {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "pulse.pressureRing.scale",
            recordFromApply(result.mutation, "pulse.pressureRing.scale"),
            {
              initialValue: pressureRingScaleLedgerRuntime.defaultValue,
              historyLimit: pressureRingScaleLedgerRuntime.historyLimit,
            },
          );
          pressureRingScaleLedgerPersistence = {
            ...persisted,
            hydrated: pressureRingScaleLedgerPersistence.hydrated,
            lastHydratedAt: pressureRingScaleLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              pressureRingScaleLedgerPersistence.lastHydrationError,
          };
        }
        MUTATION_TELEMETRY.record({
          lane: "internal_host",
          kind: "genetic_ledger_update",
          count: 1,
        });
        LOGGER.info(
          `   [PULSE] Genetic ledger update key=${update.key} tick=${result.state.lastAppliedTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastAppliedRollbackToken} source=${result.state.lastAppliedSource} reason=${result.state.lastAppliedReason}`,
        );
      }
      return result;
    }

    if (update.key === "pulse.homeostasis.targetEnergy") {
      const result = applyHomeostasisTargetEnergyLedgerUpdate({
        value: update.value,
        source: update.source,
        reason: update.reason,
        tick: update.tick,
      });
      if (result.changed) {
        if (result.mutation) {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "pulse.homeostasis.targetEnergy",
            recordFromApply(result.mutation, "pulse.homeostasis.targetEnergy"),
            {
              initialValue: homeostasisTargetEnergyLedgerRuntime.defaultValue,
              historyLimit: homeostasisTargetEnergyLedgerRuntime.historyLimit,
            },
          );
          homeostasisTargetEnergyLedgerPersistence = {
            ...persisted,
            hydrated: homeostasisTargetEnergyLedgerPersistence.hydrated,
            lastHydratedAt:
              homeostasisTargetEnergyLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              homeostasisTargetEnergyLedgerPersistence.lastHydrationError,
          };
        }
        MUTATION_TELEMETRY.record({
          lane: "internal_host",
          kind: "genetic_ledger_update",
          count: 1,
        });
        LOGGER.info(
          `   [PULSE] Genetic ledger update key=${update.key} tick=${result.state.lastAppliedTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastAppliedRollbackToken} source=${result.state.lastAppliedSource} reason=${result.state.lastAppliedReason}`,
        );
      }
      return result;
    }

    const result = applyHomeostasisBaseTaxLedgerUpdate({
      value: update.value,
      source: update.source,
      reason: update.reason,
      tick: update.tick,
    });
    if (result.changed) {
      if (result.mutation) {
        const persisted = await appendLedgerRecordAndMaybeCompact(
          "pulse.homeostasis.baseTax",
          recordFromApply(result.mutation, "pulse.homeostasis.baseTax"),
          {
            initialValue: homeostasisBaseTaxLedgerRuntime.defaultValue,
            historyLimit: homeostasisBaseTaxLedgerRuntime.historyLimit,
          },
        );
        homeostasisBaseTaxLedgerPersistence = {
          ...persisted,
          hydrated: homeostasisBaseTaxLedgerPersistence.hydrated,
          lastHydratedAt: homeostasisBaseTaxLedgerPersistence.lastHydratedAt,
          lastHydrationError:
            homeostasisBaseTaxLedgerPersistence.lastHydrationError,
        };
      }
      MUTATION_TELEMETRY.record({
        lane: "internal_host",
        kind: "genetic_ledger_update",
        count: 1,
      });
      LOGGER.info(
        `   [PULSE] Genetic ledger update key=${update.key} tick=${result.state.lastAppliedTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastAppliedRollbackToken} source=${result.state.lastAppliedSource} reason=${result.state.lastAppliedReason}`,
      );
    }
    return result;
  },
  rollbackGeneticLedgerUpdate: async (
    rollback: {
      key:
        | "pulse.homeostasis.baseTax"
        | "pulse.homeostasis.targetEnergy"
        | "pulse.pressureRing.scale";
      rollbackToken: string;
      source?: string;
      reason?: string;
      tick?: number;
    },
  ): Promise<
    | import("./GENERIC_LEDGER_SYSTEM.ts").LedgerRollbackResult<
      "pulse.homeostasis.baseTax"
    >
    | import("./GENERIC_LEDGER_SYSTEM.ts").LedgerRollbackResult<
      "pulse.homeostasis.targetEnergy"
    >
    | import("./GENERIC_LEDGER_SYSTEM.ts").LedgerRollbackResult<
      "pulse.pressureRing.scale"
    >
  > => {
    if (rollback.key === "pulse.pressureRing.scale") {
      const result = rollbackPressureRingScaleLedgerUpdate({
        rollbackToken: rollback.rollbackToken,
        source: rollback.source,
        reason: rollback.reason,
        tick: rollback.tick,
      });
      if (result.status === "rolled_back") {
        if (result.mutation) {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "pulse.pressureRing.scale",
            recordFromRollback(result.mutation, "pulse.pressureRing.scale"),
            {
              initialValue: pressureRingScaleLedgerRuntime.defaultValue,
              historyLimit: pressureRingScaleLedgerRuntime.historyLimit,
            },
          );
          pressureRingScaleLedgerPersistence = {
            ...persisted,
            hydrated: pressureRingScaleLedgerPersistence.hydrated,
            lastHydratedAt: pressureRingScaleLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              pressureRingScaleLedgerPersistence.lastHydrationError,
          };
        }
        MUTATION_TELEMETRY.record({
          lane: "internal_host",
          kind: "genetic_ledger_rollback",
          count: 1,
        });
        LOGGER.info(
          `   [PULSE] Genetic ledger rollback key=${rollback.key} tick=${result.state.lastRollbackTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastRollbackToken} source=${result.state.lastRollbackSource} reason=${result.state.lastRollbackReason}`,
        );
      }
      return result;
    }

    if (rollback.key === "pulse.homeostasis.targetEnergy") {
      const result = rollbackHomeostasisTargetEnergyLedgerUpdate({
        rollbackToken: rollback.rollbackToken,
        source: rollback.source,
        reason: rollback.reason,
        tick: rollback.tick,
      });
      if (result.status === "rolled_back") {
        if (result.mutation) {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "pulse.homeostasis.targetEnergy",
            recordFromRollback(
              result.mutation,
              "pulse.homeostasis.targetEnergy",
            ),
            {
              initialValue: homeostasisTargetEnergyLedgerRuntime.defaultValue,
              historyLimit: homeostasisTargetEnergyLedgerRuntime.historyLimit,
            },
          );
          homeostasisTargetEnergyLedgerPersistence = {
            ...persisted,
            hydrated: homeostasisTargetEnergyLedgerPersistence.hydrated,
            lastHydratedAt:
              homeostasisTargetEnergyLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              homeostasisTargetEnergyLedgerPersistence.lastHydrationError,
          };
        }
        MUTATION_TELEMETRY.record({
          lane: "internal_host",
          kind: "genetic_ledger_rollback",
          count: 1,
        });
        LOGGER.info(
          `   [PULSE] Genetic ledger rollback key=${rollback.key} tick=${result.state.lastRollbackTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastRollbackToken} source=${result.state.lastRollbackSource} reason=${result.state.lastRollbackReason}`,
        );
      }
      return result;
    }

    const result = rollbackHomeostasisBaseTaxLedgerUpdate({
      rollbackToken: rollback.rollbackToken,
      source: rollback.source,
      reason: rollback.reason,
      tick: rollback.tick,
    });
    if (result.status === "rolled_back") {
      if (result.mutation) {
        const persisted = await appendLedgerRecordAndMaybeCompact(
          "pulse.homeostasis.baseTax",
          recordFromRollback(result.mutation, "pulse.homeostasis.baseTax"),
          {
            initialValue: homeostasisBaseTaxLedgerRuntime.defaultValue,
            historyLimit: homeostasisBaseTaxLedgerRuntime.historyLimit,
          },
        );
        homeostasisBaseTaxLedgerPersistence = {
          ...persisted,
          hydrated: homeostasisBaseTaxLedgerPersistence.hydrated,
          lastHydratedAt: homeostasisBaseTaxLedgerPersistence.lastHydratedAt,
          lastHydrationError:
            homeostasisBaseTaxLedgerPersistence.lastHydrationError,
        };
      }
      MUTATION_TELEMETRY.record({
        lane: "internal_host",
        kind: "genetic_ledger_rollback",
        count: 1,
      });
      LOGGER.info(
        `   [PULSE] Genetic ledger rollback key=${rollback.key} tick=${result.state.lastRollbackTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastRollbackToken} source=${result.state.lastRollbackSource} reason=${result.state.lastRollbackReason}`,
      );
    }
    return result;
  },
  getPhysiologicalLedgerState: (): Record<
    HormoneId,
    LedgerRuntimeSnapshot<HormoneId>
  > => {
    return Object.fromEntries(
      HORMONE_BUFFER_CATALOG.map((spec) => [
        spec.id,
        snapshotLedgerRuntime(physiologicalLedgers[spec.id]),
      ]),
    ) as Record<HormoneId, LedgerRuntimeSnapshot<HormoneId>>;
  },
  getGenericLedgerSnapshots: (): Record<
    GeneticLedgerKey,
    LedgerRuntimeSnapshot<GeneticLedgerKey>
  > => {
    return {
      "pulse.homeostasis.baseTax": snapshotLedgerRuntime(
        homeostasisBaseTaxLedgerRuntime,
      ),
      "pulse.homeostasis.band": snapshotLedgerRuntime(
        homeostasisBandLedgerRuntime,
      ),
      "pulse.homeostasis.maxDelta": snapshotLedgerRuntime(
        homeostasisMaxDeltaLedgerRuntime,
      ),
      "pulse.homeostasis.overflowThreshold": snapshotLedgerRuntime(
        homeostasisOverflowThresholdLedgerRuntime,
      ),
      "pulse.homeostasis.targetEnergy": snapshotLedgerRuntime(
        homeostasisTargetEnergyLedgerRuntime,
      ),
      "pulse.pressureRing.scale": snapshotLedgerRuntime(
        pressureRingScaleLedgerRuntime,
      ),
      "daemon.maxActionsPerWindow": snapshotLedgerRuntime(
        daemonMaxActionsLedgerRuntime,
      ),
      "federation.admission.degradeEnergyRatio": snapshotLedgerRuntime(
        federationDegradeEnergyRatioLedgerRuntime,
      ),
    } as Record<GeneticLedgerKey, LedgerRuntimeSnapshot<GeneticLedgerKey>>;
  },
  getHomeostasisState: (): HomeostasisState => snapshotHomeostasisState(),
  updateHomeostasisPolicy: (
    update: {
      source?: string;
      reason?: string;
      tick?: number;
    },
  ): HomeostasisState => {
    const source = (update.source ?? "runtime").trim();
    const reason = (update.reason ?? "manual_update").trim();
    homeostasisLastUpdateSource = source.length > 0 ? source : "runtime";
    homeostasisLastUpdateReason = reason.length > 0 ? reason : "manual_update";
    homeostasisLastUpdateTick = update.tick !== undefined
      ? Math.max(0, Math.floor(update.tick))
      : Atomics.load(STATE_MATRIX.tickCounter, 0);

    return snapshotHomeostasisState();
  },
  updateEvolutionPressureRing: (
    update: {
      mode: "set" | "step";
      theta?: number;
      deltaTheta?: number;
      enabled?: boolean;
      source?: string;
    },
  ): EvolutionPressureState => {
    const boundedDelta = update.deltaTheta === undefined
      ? undefined
      : Math.max(-Math.PI, Math.min(Math.PI, update.deltaTheta));
    const boundedTheta = update.theta === undefined
      ? undefined
      : normalizeTheta(update.theta);
    const applied = applyEvolutionPressureRing({
      mode: update.mode,
      theta: boundedTheta,
      deltaTheta: boundedDelta,
      enabled: update.enabled,
    });
    LOGGER.info(
      `   [PULSE] Evolution pressure ring update source=${
        update.source ?? "runtime"
      } mode=${update.mode} novelty=${applied.noveltySigned} symbiosis=${applied.symbiosisSigned} fear=${applied.fear} ego=${applied.ego} enabled=${applied.ring.enabled} theta=${
        applied.ring.theta.toFixed(4)
      } scale=${applied.ring.scale}.`,
    );
    return applied;
  },

  tick: async () => {
    if (workers.length === 0) {
      await PULSE.initWorkers();
    }
    if (wasmBootDegraded) {
      return;
    }
    if (workers.length === 0) {
      throw new Error(
        `[PULSE] No workers ready for tick. reason=${
          wasmBootReason || "WORKERS_UNAVAILABLE"
        }`,
      );
    }

    const { syncState, tickCounter, SYNC } = STATE_MATRIX;
    // Sync physiological hormones into shared memory lattice so WASM λ-VM can read them.
    const computedHormones = syncHormonesToLattice({
      baseTax: homeostasisBaseTaxRuntime,
      targetEnergy: homeostasisTargetEnergyRuntime,
      workerCount: WORKER_COUNT,
      egoPressure: evolutionPressureState.ego,
      fearPressure: evolutionPressureState.fear,
      noveltyPressure: evolutionPressureState.novelty,
      symbiosisPressure: evolutionPressureState.symbiosis,
      maxPlasmidCharge: DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge,
      pressureRingScale: evolutionPressureState.ring.scale,
      // Generic Ledger inputs (Stage 7.2)
      homeostasisBand: homeostasisBandLedgerRuntime.currentValue,
      homeostasisMaxDelta: homeostasisMaxDeltaLedgerRuntime.currentValue,
      homeostasisOverflowThreshold:
        homeostasisOverflowThresholdLedgerRuntime.currentValue,
      daemonMaxActions: daemonMaxActionsLedgerRuntime.currentValue,
      federationDegradeEnergyRatio:
        federationDegradeEnergyRatioLedgerRuntime.currentValue,
      globalSyntropy: 0, // Will be updated if syntropy is available
    });

    for (const spec of HORMONE_BUFFER_CATALOG) {
      const liveVal = computedHormones[spec.id];
      const res = applyLedgerUpdate(physiologicalLedgers[spec.id], {
        value: liveVal,
        tick: -1,
        source: "pulse",
        reason: "physiological_sync",
      });
      physiologicalLedgers[spec.id] = res.state;
      STATE_MATRIX.setHormone(spec.index, res.state.currentValue);
    }

    try {
      // 0. Sovereign Oracle Peak Detection & Coherence Polling
      const currentTick = Atomics.load(tickCounter, 0);
      PULSE.currentPulseId = currentTick;
      const dumpA11 = (lbl: string) => {
        const xs = new Int16Array(
          STATE_MATRIX.wasmMemory.buffer,
          OFFSETS.XS_OFFSET,
          OFFSETS.MAX_ATOMS,
        );
        LOGGER.debug(
          `[PULSE TRACE] ${lbl} -> Atom 11 X=${xs[11]} or 15 X=${xs[15]}`,
        );
      };

      dumpA11("Before Quorum");
      const activeIdx = STATE_MATRIX.getActiveIndices();

      // Stage 25: Sovereign Feedback - Syntropy-modulated tax
      // Move evaluation earlier so it can affect metabolism and gate
      const syntropy = quorumAdvocate.evaluateQuorum(activeIdx);

      dumpA11("Before Coherence");

      const noveltyDriftRatio = (noveltyHistory.sum() / noveltyHistory.size()) /
        1000.0;
      // Poll Coherence from Worker 0 (WASM primary) - MUST happen before reset
      const coherencePulseId = nextPulseId();
      const coherenceRes = await postAndWait<{ coherence: number }>(
        0,
        workers[0],
        { type: "POLL_COHERENCE", pulseId: coherencePulseId },
        "COHERENCE_VAL",
      );
      const coherence = coherenceRes.coherence ?? 0;
      SOVEREIGN_ORACLE.neuralCoherence = coherence;

      dumpA11("Before Hormones");

      // Reset global neural coherence aggregation field for the NEXT tick.
      Atomics.store(STATE_MATRIX.coherence, 0, 0); // Accumulator (Vector 10)
      Atomics.store(STATE_MATRIX.neuralCoherence, 0, 0); // Broadcast

      // Broadcast a threshold-clamped coherence channel for guardian scripts.
      const guardianChannel = Math.max(0, Math.min(200, coherence));
      workers[0].postMessage({
        type: "SET_COHERENCE",
        coherence: guardianChannel,
        pulseId: nextPulseId(),
      });

      dumpA11("Before Bonds");

      // Update Hormones with actual Syntropy
      const finalHormones = syncHormonesToLattice({
        baseTax: homeostasisBaseTaxRuntime,
        targetEnergy: homeostasisTargetEnergyRuntime,
        workerCount: WORKER_COUNT,
        egoPressure: evolutionPressureState.ego,
        fearPressure: evolutionPressureState.fear,
        noveltyPressure: evolutionPressureState.novelty,
        symbiosisPressure: evolutionPressureState.symbiosis,
        maxPlasmidCharge: DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge,
        pressureRingScale: evolutionPressureState.ring.scale,
        homeostasisBand: homeostasisBandLedgerRuntime.currentValue,
        homeostasisMaxDelta: homeostasisMaxDeltaLedgerRuntime.currentValue,
        homeostasisOverflowThreshold:
          homeostasisOverflowThresholdLedgerRuntime.currentValue,
        daemonMaxActions: daemonMaxActionsLedgerRuntime.currentValue,
        federationDegradeEnergyRatio:
          federationDegradeEnergyRatioLedgerRuntime.currentValue,
        globalSyntropy: syntropy,
      });

      for (const spec of HORMONE_BUFFER_CATALOG) {
        const liveVal = finalHormones[spec.id];
        const res = applyLedgerUpdate(physiologicalLedgers[spec.id], {
          value: liveVal,
          tick: currentTick,
          source: "pulse",
          reason: "physiological_sync",
        });
        physiologicalLedgers[spec.id] = res.state;
        STATE_MATRIX.setHormone(spec.index, res.state.currentValue);
      }

      if (coherence > 1000) {
        LOGGER.debug(
          `🧠 [PULSE] High Coherence detected: ${coherence}. Consulting Oracle...`,
        );
      }

      const telemetry = SOVEREIGN_ORACLE.gatherEpochTelemetry();
      SOVEREIGN_ORACLE.broadcastWhisper(currentTick, telemetry, coherence);
      // Trigger Oracle on either Matrix Resonance spike or High Coherence
      if (telemetry.matrixResonance > 5000 || coherence > 500) {
        const regent = SOVEREIGNTY_ENGINE.electRegent(activeIdx);
        if (regent && regent.idx !== -1) {
          SOVEREIGN_ORACLE.consultOracle(regent.idx, telemetry);
        }
      }

      // 1. Resolve Sequential Logic (WASM)
      const bondPulseId = nextPulseId();
      const bondRes = await postAndWait<{ count: number }>(
        0,
        workers[0],
        {
          type: "RESOLVE_BONDS",
          pulseId: bondPulseId,
          startIdx: 0,
          endIdx: OFFSETS.MAX_ATOMS,
        },
        "RESOLVE_BONDS_DONE",
      );
      if (bondRes.count > 0) {
        MUTATION_TELEMETRY.record({
          lane: "internal_wasm",
          kind: "bond_pair_resolution",
          count: bondRes.count,
        });
        MUTATION_TELEMETRY.record({
          lane: "internal_wasm",
          kind: "bond_request_clear",
          count: bondRes.count,
        });
      }

      dumpA11("After Bonds");

      // 2. Parallel Physics & WASM Kernel
      // 2a. Rebuild Spatial Lattice (WASM)
      const hashPulseId = nextPulseId();
      const hashRes = await postAndWait<
        { overflowCount?: number; maxCellCount?: number }
      >(
        0,
        workers[0],
        {
          type: "BUILD_SPATIAL_HASH",
          pulseId: hashPulseId,
        },
        "HASH_DONE",
      );
      const overflowCount = Number.isFinite(hashRes.overflowCount)
        ? Math.max(0, Math.floor(Number(hashRes.overflowCount)))
        : 0;
      const maxCellCount = Number.isFinite(hashRes.maxCellCount)
        ? Math.max(0, Math.floor(Number(hashRes.maxCellCount)))
        : 0;
      const activeCount = Math.max(1, activeIdx.length);
      spatialHashState = {
        tick: currentTick,
        overflowCount,
        maxCellCount,
        overflowRatio: Number((overflowCount / activeCount).toFixed(6)),
      };
      if (overflowCount > 0 && currentTick % 20 === 0) {
        LOGGER.warn(
          `⚠️ [SPATIAL_HASH] overflow=${overflowCount} maxCell=${maxCellCount} active=${activeIdx.length}`,
        );
      }

      // 2a.1 Freeze position snapshot for deterministic physics reads across workers.
      {
        readXsView.set(xsView);
        readYsView.set(ysView);
        readEnergiesView.set(energiesView);
        readResonancesView.set(resonancesView);
        if (currentTick <= 104) {
          LOGGER.info(
            `DEBUG [PULSE.ts]: tick=${currentTick} xsView[11]=${
              xsView[11]
            }, readXsView[11]=${readXsView[11]}`,
          );
        }
      }
      // 2b. Execute Physics (WASM)
      // Transition to WASM_TICKING (1) to unblock workers
      Atomics.store(syncState, 0, SYNC.WASM_TICKING);
      Atomics.notify(syncState, 0);
      await dispatchRangePhase("PULSE", "DONE");

      // 2c. Reduce cross-atom deltas inside WASM over deterministic index ranges.
      await dispatchRangePhase("REDUCE_DELTAS", "DELTA_DONE");
      dumpA11("After Reduce Deltas");

      // --- PHASE 2: Matrix Environment Execution (Worker 0 ONLY) ---
      // worker.ts message handler for 'TICK_ENVIRONMENT'.
      const environmentPulseId = nextPulseId();
      await postAndWait(0, workers[0], {
        type: "TICK_ENVIRONMENT",
        tick: currentTick,
        pulseId: environmentPulseId,
      }, "ENVIRONMENT_DONE");
      dumpA11("After Environment");

      // --- TRANSITION TO HOST_LOCK ---
      // Matrix is now settled, workers are done. Lock for host-side logic & SNAPSHOTS.
      Atomics.store(syncState, 0, SYNC.HOST_LOCK);
      Atomics.notify(syncState, 0);

      // --- PHASE 50: TRANSACTIONAL PANOPTICON TELEMETRY ---
      const nowMs = performance.now();
      if (nowMs - lastPanopticonBroadcastTime >= 50) { // ~20fps
        const frame = STATE_MATRIX.packPanopticonFrame();
        PANOPTICON_SERVER.broadcastBinaryFrame(frame);
        lastPanopticonBroadcastTime = nowMs;
      }

      // --- SNAP PHASE: Asynchronous Matrix Persistence ---
      // Moved into HOST_LOCK to prevent torn reads during slice
      if (
        RUNTIME_POLICY.snapshot.enabled &&
        currentTick > 0 &&
        currentTick % RUNTIME_POLICY.snapshot.intervalTicks === 0
      ) {
        // We trigger save but don't await it to avoid blocking the heartbeat.
        // It will complete in the background.
        SNAP_ENGINE.save(currentTick).then(() => {
          SNAP_ENGINE.cleanup(RUNTIME_POLICY.snapshot.retention);
        });
      }

      // --- STAGE 26: CONTINUUM CHRONOSPHERE EPOCHS (HEARTBEAT) ---
      if (currentTick > 0 && currentTick % 10000 === 0) {
        LOGGER.info(
          `[CONTINUUM] Pulse Heartbeat triggered at tick ${currentTick}. Archiving Epoch...`,
        );
        const pCount = activeIdx.length;
        const autoEpochId = `auto_tick_${currentTick}`;
        const epochHash = await PULSE.generateEpochProof(currentTick);
        await saveEpoch(
          STATE_MATRIX.wasmMemory,
          currentTick,
          autoEpochId,
          pCount,
          0,
          epochHash,
        );
        LOGGER.info(
          `[CONTINUUM] Epoch ${autoEpochId}.sigma securely sealed into Chronosphere. (Proof: ${epochHash})`,
        );
      }

      // --- STAGE 27/28: META-KURAMOTO SWARM MEMBRANE & P2P NEXUS ---
      if (currentTick > 0 && currentTick % SWARM_NODE.heartbeatInterval === 0) {
        let totalPhase = 0;
        for (const idx of activeIdx) {
          totalPhase += Math.abs(STATE_MATRIX.getPhase(idx));
        }
        const avgPhase = activeIdx.length > 0
          ? totalPhase / activeIdx.length
          : 0;
        const epochHash = await PULSE.generateEpochProof(currentTick);
        const egressEvents = drainEgressEvents();
        SWARM_NODE.evaluateHeartbeat(
          currentTick,
          epochHash,
          avgPhase,
          egressEvents.length,
        );
      }

      const egressEvents = drainEgressEvents();
      if (egressEvents.length > 0) {
        for (const ev of egressEvents) {
          NEXUS_DAEMON.routeAtom(ev);
        }
      }

      SOVEREIGN_ORACLE.drainPendingMutations();
      await CONTROL_INTENT_QUEUE.applyHostLockBudget();
      dumpA11("End of TICK phase 1");

      // 3.1 Tick Glyph Transport (WASM) [Stage 5.1]
      const transportPulseId = nextPulseId();
      await postAndWait(0, workers[0], {
        type: "TICK_GLYPH_TRANSPORT",
        tick: currentTick,
        pulseId: transportPulseId,
      }, "GLYPH_TRANSPORT_DONE");

      // 3.5 Sort Spawn Requests Deterministically
      const writeHead = Atomics.load(spawnHeadView, 0);
      const readHead = Atomics.load(spawnHeadView, 1);
      const pendingCount = writeHead - readHead;

      if (pendingCount > 1) {
        const SPAWN_MAX = 1024;
        const SPAWN_SLOT = 16;
        const requests = [];

        for (let i = 0; i < pendingCount; i++) {
          const cursor = readHead + i;
          const slotOff = (cursor % SPAWN_MAX) * SPAWN_SLOT;
          const reqBytes = new Uint8Array(16);
          for (let b = 0; b < 16; b++) {
            reqBytes[b] = spawnDataView.getUint8(slotOff + b);
          }
          requests.push(reqBytes);
        }

        // Lexicographical sort
        requests.sort((a, b) => {
          for (let i = 0; i < 16; i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
          }
          return 0;
        });

        for (let i = 0; i < pendingCount; i++) {
          const cursor = readHead + i;
          const slotOff = (cursor % SPAWN_MAX) * SPAWN_SLOT;
          for (let b = 0; b < 16; b++) {
            spawnDataView.setUint8(slotOff + b, requests[i][b]);
          }
        }
      }

      // 4. Drain Spawn Queue (WASM)
      const spawnPulseId = nextPulseId();
      const spawnRes = await postAndWait<{ count: number }>(
        0,
        workers[0],
        {
          type: "DRAIN_SPAWN",
          tick: currentTick,
          pulseId: spawnPulseId,
        },
        "DRAIN_SPAWN_DONE",
      );
      if (spawnRes.count > 0) {
        LOGGER.debug(
          `🌱 [PULSE] WASM Spawned ${spawnRes.count} atoms with RISC boot scripts.`,
        );
        MUTATION_TELEMETRY.record({
          lane: "internal_wasm",
          kind: "spawn_seed_atom",
          count: spawnRes.count,
        });

        // --- STAGE 22: ADAPTIVE INCEPTION ---
        // Find newly spawned atoms (those with IDs but empty instructions/role)
        // and inject evolved programs.
        for (let idx = 0; idx < OFFSETS.MAX_ATOMS; idx++) {
          if (idsView[idx] !== 0n && instructionsView[idx * 64] === 0) {
            // This is likely a fresh spawn. Incept it.
            const prog = genesisInceptor.selectProgram();
            const lineageHash = prog.metadata?.ancestorHash ?? 0n;

            STATE_MATRIX.setInstructions(idx, new Uint8Array(prog.bytecode));
            STATE_MATRIX.setLineage(idx, lineageHash);

            // Mark its role if the program is for a specific one (e.g. role hint)
            // For now, we'll let the role be assigned by the first op if needed,
            // or just set a default.
          }
        }
      }

      // 5. Metabolic and Homeostasis Closure (WASM)
      // Pass 1: Accumulate genome frequencies (Scratch Space)
      const clearStatsPulseId = nextPulseId();
      await postAndWait(0, workers[0], {
        type: "METABOLISM_ACCUMULATE",
        startIdx: 0,
        endIdx: OFFSETS.MAX_ATOMS,
        clear: true,
        pulseId: clearStatsPulseId,
      }, "METABOLISM_ACCUMULATE_DONE");

      // Pass 2: Apply Metabolism (Parallel)
      const pressureState = snapshotEvolutionPressureState();

      applyEvolutionPressureTerms(currentTick, activeIdx);
      applyEnergyHomeostasisTerms(
        currentTick,
        activeIdx,
        spatialHashState.overflowRatio,
      );

      // Sovereign Feedback: Tax reduction based on structural organization (Syntropy)
      const baseTaxRaw = clampHomeostasisBaseTax(homeostasisBaseTaxRuntime);
      const taxDiscount = Math.min(0.8, syntropy * 1.5); // Max 80% tax reduction at high syntropy
      const baseTax = Math.max(0, Math.round(baseTaxRaw * (1 - taxDiscount)));

      if (currentTick % 20 === 0 && syntropy > 0.1) {
        LOGGER.info(
          `⚖️ [SOVEREIGN] Metabolic Tax Discount: ${
            (taxDiscount * 100).toFixed(1)
          }% (Syntropy: ${syntropy.toFixed(3)})`,
        );
      }

      const targetEnergy = clampHomeostasisTargetEnergy(
        homeostasisTargetEnergyRuntime,
      );

      const metabolismPromises: Promise<any>[] = [];
      const chunkSize = Math.ceil(OFFSETS.MAX_ATOMS / runtimeWorkerCount);
      for (let i = 0; i < runtimeWorkerCount; i++) {
        const startIdx = i * chunkSize;
        const endIdx = i === runtimeWorkerCount - 1
          ? OFFSETS.MAX_ATOMS
          : Math.min(OFFSETS.MAX_ATOMS, (i + 1) * chunkSize);

        metabolismPromises.push(postAndWait(
          i,
          workers[i],
          {
            type: "METABOLISM_APPLY",
            pulseId: nextPulseId(),
            startIdx,
            endIdx,
            noveltySigned: pressureState.noveltySigned,
            symbiosisSigned: pressureState.symbiosisSigned,
            baseTax,
            targetEnergy,
            homeostasisBand: homeostasisBandLedgerRuntime.currentValue,
            homeostasisMaxDelta: homeostasisMaxDeltaLedgerRuntime.currentValue,
            overflowThreshold:
              homeostasisOverflowThresholdLedgerRuntime.currentValue,
            spatialOverflowRatio: spatialHashState.overflowRatio,
            starvationFloor: HOMEOSTASIS_STARVATION_FLOOR,
            subsidyEnabled: HOMEOSTASIS_SUBSIDY_ENABLED,
          },
          "METABOLISM_APPLY_DONE",
        ));
      }
      await Promise.all(metabolismPromises);

      // 6. Sequential Maintenance (Sequential JS)

      // --- STAGE 26: Immunological Phagocyte ---
      {
        const entropyPressure = STATE_MATRIX.getHormone(0); // H0: entropy_pressure
        const purgeList = IMMUNE.phagocytePass(entropyPressure);
        if (purgeList.length > 0) {
          for (const idx of purgeList) {
            STATE_MATRIX.recycleAtom(idx);
          }
          await AKASHA_CODEX.recordImmunologicalPurge(purgeList.length);
          LOGGER.info(
            `🛡️ [IMMUNE] Phagocyte Purge: ${purgeList.length} necrotic/drifting atoms recycled. (H0: ${entropyPressure})`,
          );
        }
      }

      // --- STAGE 8: Hybrid Promotion Bridge (Guardians & Architects) ---
      {
        const gMode = GUARDIAN_SIGNAL_EXECUTION_MODE;
        const aMode = ARCHITECT_PLASMID_EXECUTION_MODE;
        guardianSignalHybridState.lastMode = gMode;
        architectPlasmidHybridState.lastMode = aMode;
        const scrollRange = 16;

        for (const idx of activeIdx) {
          const role = rolesView[idx];
          if (role === STATE_MATRIX.ROLE_GUARDIAN) {
            const script = instructionsView.slice(idx * 64, idx * 64 + 64);
            const decision = evaluateGuardianSignalExecution({
              mode: gMode,
              script,
              neuralCoherence: SOVEREIGN_ORACLE.neuralCoherence,
              legacyAllowed: true,
              maxSteps: scrollRange,
            });

            // Update Guardian Telemetry
            if (gMode === "hybrid-reduce") {
              guardianSignalHybridState.hybridRuns++;
              if (decision.allowed) {
                guardianSignalHybridState.allowedGuardianSignals++;
              } else {
                guardianSignalHybridState.suppressedGuardianSignals++;
              }
            } else if (gMode === "shadow-reduce") {
              guardianSignalHybridState.shadowRuns++;
              if (decision.shadowSuppressed) {
                guardianSignalHybridState.shadowSuppressedGuardianSignals++;
              }
            }

            if (decision.status === "fallback") {
              guardianSignalHybridState.fallbackRuns++;
              guardianSignalHybridState.lastFallbackReason =
                decision.fallbackReason || "unknown_error";
            }

            if (decision.branch === "stable") {
              guardianSignalHybridState.stableBranchCount++;
            }
            if (decision.branch === "repair") {
              guardianSignalHybridState.repairBranchCount++;
            }

            guardianSignalHybridState.lastTick = currentTick;
            guardianSignalHybridState.lastStatus = decision.status;
            guardianSignalHybridState.lastBranch = decision.branch;

            // Apply Causality Suppression
            const allowed = decision.allowed &&
              guardianPheromoneAllowedByExecutionMode(idx);
            Atomics.store(causalityView, idx, allowed ? 1 : 0);
          } else if (role === STATE_MATRIX.ROLE_ARCHITECT) {
            const script = instructionsView.slice(idx * 64, idx * 64 + 64);
            const decision = evaluateArchitectPlasmidExecution({
              mode: aMode,
              script,
              neuralCoherence: SOVEREIGN_ORACLE.neuralCoherence,
              legacyAllowed: true,
            });

            // Update Architect Telemetry
            if (aMode === "hybrid-reduce") {
              architectPlasmidHybridState.hybridRuns++;
              if (decision.allowed) {
                architectPlasmidHybridState.allowedArchitectPlasmids++;
              } else {
                architectPlasmidHybridState.suppressedArchitectPlasmids++;
              }
            } else if (aMode === "shadow-reduce") {
              architectPlasmidHybridState.shadowRuns++;
              if (decision.shadowSuppressed) {
                architectPlasmidHybridState.shadowSuppressedArchitectPlasmids++;
              }
            }

            if (decision.status === "fallback") {
              architectPlasmidHybridState.fallbackRuns++;
              architectPlasmidHybridState.lastFallbackReason =
                decision.fallbackReason || "unknown_error";
            }

            if (decision.branch === "emit") {
              architectPlasmidHybridState.emitBranchCount++;
            }
            if (decision.branch === "suppress") {
              architectPlasmidHybridState.suppressBranchCount++;
            }

            architectPlasmidHybridState.lastTick = currentTick;
            architectPlasmidHybridState.lastStatus = decision.status;
            architectPlasmidHybridState.lastBranch = decision.branch;

            // Apply Causality Suppression for Plasmids
            const allowed = decision.allowed &&
              architectPlasmidAllowedByExecutionMode(idx);
            Atomics.store(causalityView, idx, allowed ? 1 : 0);
          } else {
            // Non-governed roles are always allowed
            Atomics.store(causalityView, idx, 1);
          }

          // Replication Hybrid Bridge (Universal for all atoms)
          const rMode = REPLICATION_EXECUTION_MODE;
          replicationHybridState.lastMode = rMode;
          const replicationDecision = evaluateReplicationExecution({
            mode: rMode,
            script: instructionsView.slice(idx * 64, idx * 64 + 64),
            energy: energiesView[idx],
            resonance: resonancesView[idx],
            aggression: STATE_MATRIX.getHormone(2),
            legacyAllowed: true,
          });

          // Update Replication Telemetry
          if (rMode === "hybrid-reduce") {
            replicationHybridState.hybridRuns++;
            if (replicationDecision.allowed) {
              replicationHybridState.allowedReplications++;
            } else {
              replicationHybridState.suppressedReplications++;
            }
          } else if (rMode === "shadow-reduce") {
            replicationHybridState.shadowRuns++;
            if (replicationDecision.shadowSuppressed) {
              replicationHybridState.shadowSuppressedReplications++;
            }
          }

          if (replicationDecision.status === "fallback") {
            replicationHybridState.fallbackRuns++;
            replicationHybridState.lastFallbackReason =
              replicationDecision.fallbackReason || "unknown_error";
          }

          if (replicationDecision.branch === "emit") {
            replicationHybridState.emitBranchCount++;
          }
          if (replicationDecision.branch === "suppress") {
            replicationHybridState.suppressBranchCount++;
          }

          replicationHybridState.lastTick = currentTick;
          replicationHybridState.lastStatus = replicationDecision.status;
          replicationHybridState.lastBranch = replicationDecision.branch;

          // Universal Replication Causality Integration
          // If replication is suppressed by hybrid mode, we must ensure causality is 0
          // (Wait, this is tricky: causality=0 suppresses EVERYTHING secretion/replication etc.)
          // If role-based logic said 'allowed', but replication said 'suppressed', should we block the whole atom?
          // For now, we only block if BOTH are in hybrid mode and say no, or if we want to be strict.
          // Correct implementation: causality bit is a combined gate.
          if (rMode === "hybrid-reduce" && !replicationDecision.allowed) {
            Atomics.store(causalityView, idx, 0);
          }
        }
      }

      // Decay host pheromone fields (DEPRECATED: Now handled in WASM tick_environment)
      // PHYSICS_ENGINE.decayPheromones();

      // 7. Autonomous Systemic Audit (Every 5 ticks)
      if (currentTick % 5 === 0) {
        MUTATION_TELEMETRY.record({
          lane: "canonical_gate",
          kind: "audit_matrix_cycle",
          count: 1,
        });
        GATE.auditMatrix(STATE_MATRIX);
      }

      // --- RESONANCE PROTOCOL: Global Coherence Calculation ---
      {
        let totalResonance = 0;
        for (const idx of activeIdx) {
          totalResonance += resonancesView[idx];
        }
        // Average Resonance normalized to 0-255 (Absolute Coherence)
        const avgRes = activeIdx.length > 0
          ? (totalResonance / activeIdx.length)
          : 0;
        const coherence = Math.min(255, Math.floor(avgRes / 100));

        // Write to Unified Lattice
        Atomics.store(coherenceView, 0, coherence);

        if (currentTick % 20 === 0) {
          LOGGER.debug(
            `💎 [RESONANCE] System Coherence: ${coherence}/255 (Avg Res: ${
              (avgRes / 100).toFixed(1)
            })`,
          );
          // --- STAGE 43: GOVERNANCE LAB (PREDICTION MARKET) ---
          if (currentTick > 0 && currentTick % 2000 === 0) {
            PREDICTION_MARKET.resolveCrisis();
            PREDICTION_MARKET.distributeDividends();

            const active = STATE_MATRIX.getActiveIndices();
            if (active.length > 0) {
              let eliteIdx = active[0];
              let maxEnergy = 0;
              for (const idx of active) {
                const energy = STATE_MATRIX.getEnergy(idx);
                if (energy > maxEnergy) {
                  maxEnergy = energy;
                  eliteIdx = idx;
                }
              }
              if (maxEnergy > 50000) {
                const eliteGenome = STATE_MATRIX.getInstructions(eliteIdx);
                PREDICTION_MARKET.startCrisis(eliteGenome);
              }
            }
          }

          // --- STAGE 22: DRIFT WARDEN AUDIT ---
          const drift = driftWarden.analyze(currentTick);
          if (drift.shadowForkRecommended && !shadowForkActive) {
            LOGGER.warn(
              `🚨 [ADAPTIVE] High Drift (${
                drift.driftIndex.toFixed(4)
              }) detected. Triggering autonomous shadow rehearsal...`,
            );
            shadowForkActive = true;
            (async () => {
              try {
                const fork = new DollFork();
                const runner = new DollForkRunner(fork);
                await runner.init();
                fork.forkFromMainline();
                // Run a 10-tick rehearsal
                for (let s = 0; s < 10; s++) {
                  runner.runShadowTick(currentTick + s);
                }
                LOGGER.info(
                  `✅ [ADAPTIVE] Shadow rehearsal complete for drift at tick ${currentTick}.`,
                );
              } catch (e) {
                LOGGER.error(`❌ [ADAPTIVE] Shadow rehearsal failed:`, e);
              } finally {
                shadowForkActive = false;
              }
            })();
          }
        }
      }

      MUTATION_TELEMETRY.flushIfDue(currentTick);
      const glyphSnapshot = GLYPH_BUFFER.snapshot();
      lineageTracker.syncLineages(activeIdx);

      // --- STAGE 6: Codex evidence record ---
      AKASHA_CODEX.observePulse(
        currentTick,
        activeIdx.length,
        glyphSnapshot,
        syntropy, // already calculated earlier in this tick
      );
      // Increment Global Tick Counter
      Atomics.add(tickCounter, 0, 1);

      // --- PHASE 29: Σ-CORE Byzantine Synchronization ---
      NEXUS_DAEMON.localCurrentTick = currentTick;
      const now = performance.now();
      const dt = now - lastTickTime;
      if (dt > 1000) {
        NEXUS_DAEMON.localTps = (currentTick - tickCountLog) / (dt / 1000);
        lastTickTime = now;
        tickCountLog = currentTick;
      }

      const medianTick = NEXUS_DAEMON.getMedianSwarmTick(currentTick);
      if (currentTick > medianTick + MAX_TICK_DRIFT) {
        await new Promise((r) => setTimeout(r, 10)); // Elastic yield bounds
      }

      if (currentTick > 0 && currentTick % 10000 === 0) {
        let hashSum = 0n;
        for (let i = 1; i < STATE_MATRIX.MAX_ATOMS; i++) {
          if (STATE_MATRIX.getEnergy(i) > 0) {
            hashSum += BigInt(STATE_MATRIX.getEnergy(i)) +
              BigInt(STATE_MATRIX.getPhase(i));
          }
        }
        NEXUS_DAEMON.broadcastEpochConsensus(currentTick, hashSum);
      }

      // SNAP PHASE was relocated to HOST_LOCK (Phase 50)
    } finally {
      Atomics.store(syncState, 0, SYNC.IDLE);
      Atomics.notify(syncState, 0);
    }
  },
  getWorker: (idx: number): any => workers[idx],
  drainEgressEvents,
  injectForeignAtom: (payload: Uint8Array) => {
    const view = new DataView(
      payload.buffer,
      payload.byteOffset,
      payload.byteLength,
    );
    const genome = payload.slice(0, 64);
    const energy = view.getInt32(64, true);
    const phase = view.getInt32(68, true);
    const resonance = view.getInt32(72, true);
    let nx = view.getInt32(76, true);
    let ny = view.getInt32(80, true);

    // Teleport to opposite edge
    if (nx <= 0) nx = Math.floor(OFFSETS.GRID_W * 10 - 1);
    else if (nx >= Math.floor(OFFSETS.GRID_W * 10 - 1)) nx = 0;

    if (ny <= 0) ny = Math.floor(OFFSETS.GRID_H * 10 - 1);
    else if (ny >= Math.floor(OFFSETS.GRID_H * 10 - 1)) ny = 0;

    const role = payload[148];

    const atomIdx = STATE_MATRIX.findEmptySlot();
    if (atomIdx > 0) {
      STATE_MATRIX.setEnergy(atomIdx, energy);
      STATE_MATRIX.setResonance(atomIdx, resonance);
      STATE_MATRIX.setPhase(atomIdx, phase);
      STATE_MATRIX.setId(
        atomIdx,
        BigInt(PULSE.currentPulseId) << 16n | BigInt(atomIdx),
      );
      STATE_MATRIX.setRole(atomIdx, role);

      const xs = new Int16Array(
        STATE_MATRIX.wasmMemory.buffer,
        OFFSETS.XS_OFFSET,
        OFFSETS.MAX_ATOMS,
      );
      const ys = new Int16Array(
        STATE_MATRIX.wasmMemory.buffer,
        OFFSETS.YS_OFFSET,
        OFFSETS.MAX_ATOMS,
      );
      Atomics.store(xs, atomIdx, nx);
      Atomics.store(ys, atomIdx, ny);

      STATE_MATRIX.setInstructions(atomIdx, genome);

      const ctxView = new Int32Array(
        STATE_MATRIX.wasmMemory.buffer,
        OFFSETS.CONTEXT_OFFSET + atomIdx * 64,
        16,
      );
      for (let i = 0; i < 16; i++) {
        Atomics.store(ctxView, i, view.getInt32(84 + i * 4, true));
      }
    }
  },
};

// --- INLINED FROM runtime_bridge/architect_plasmid_hybrid.ts ---

export type ArchitectPlasmidExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type ArchitectPlasmidBranch = "emit" | "suppress" | "unknown";

export type ArchitectPlasmidReductionDecision = {
  status: "ok" | "fallback";
  branch: ArchitectPlasmidBranch;
  plasmidAllowed: boolean;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type ArchitectPlasmidExecutionDecision = {
  mode: ArchitectPlasmidExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: ArchitectPlasmidBranch;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  shadowSuppressed: boolean;
  hybridSuppressed: boolean;
  fallbackReason?: string;
};

type ArchitectShadowState = {
  pc: number;
  regs: number[];
  role: number;
  neuralCoherence: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
};

type ArchitectToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_ARCHITECT_MAX_STEPS = 8;
const SUPPORTED_ARCHITECT_PROPS = {
  [RISC.PROP_NEURAL_COHERENCE]: true,
} as const;
const SUPPORTED_ARCHITECT_OPCODE_LENGTHS = new Map<number, number>([
  [RISC.OP_SET, 3],
  [RISC.OP_GET, 3],
  [RISC.OP_SUB, 3],
  [RISC.OP_JNZ, 3],
  [RISC.OP_JMP, 2],
  [RISC.OP_SIGNAL, 1],
  [RISC.OP_ROLE, 3],
  [RISC.OP_BUILD, 3],
  [RISC.OP_SYSCALL, 1],
]);

export const normalizeArchitectPlasmidExecutionMode = (
  raw: string | undefined,
): ArchitectPlasmidExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createArchitectInitialState = (
  neuralCoherence: number,
): ArchitectShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  role: 0,
  neuralCoherence: Math.max(0, Math.floor(neuralCoherence)),
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
});

const decodeArchitectTape = (
  script: Uint8Array,
  maxTokens: number,
): ArchitectToken[] => {
  const out: ArchitectToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? RISC.OP_NOP;
    if (opcode === RISC.OP_NOP) break;
    const length = SUPPORTED_ARCHITECT_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(`unsupported_architect_opcode_0x${opcode.toString(16)}`);
    }
    out.push({
      pc,
      opcode,
      length,
      args: Array.from(script.slice(pc + 1, pc + length)),
    });
    pc += length;
    steps++;
  }
  return out;
};

const classifyArchitectBranch = (
  state: ArchitectShadowState,
): ArchitectPlasmidBranch => {
  if (
    state.buildCount > 0 &&
    state.role === STATE_MATRIX.ROLE_ARCHITECT
  ) {
    return "emit";
  }
  if (state.signalCount > 0 && state.buildCount === 0) {
    return "suppress";
  }
  return "unknown";
};

const applyArchitectOpcode = (
  state: ArchitectShadowState,
  token: ArchitectToken,
): void => {
  switch (token.opcode) {
    case RISC.OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (!(prop in SUPPORTED_ARCHITECT_PROPS)) {
        throw new Error(`unsupported GET prop=${prop}`);
      }
      state.regs[reg] = state.neuralCoherence;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SET: {
      const reg = token.args[0] ?? 0;
      state.regs[reg] = token.args[1] ?? 0;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SUB: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case RISC.OP_JNZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.branchTaken = true;
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case RISC.OP_JMP: {
      state.pc = token.args[0] ?? 0;
      return;
    }
    case RISC.OP_ROLE: {
      const mode = token.args[0] ?? 0;
      const role = token.args[1] ?? 0;
      if (mode === 0) state.role = role;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SIGNAL: {
      state.signalCount++;
      state.pc += token.length;
      return;
    }
    case RISC.OP_BUILD: {
      state.buildCount++;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS.YIELD) {
        // no-op
      } else if (sysId === SYS.SET_ROLE) {
        state.role = state.regs[1] ?? 0;
      } else {
        throw new Error(
          `unsupported architect bridge syscall=0x${sysId.toString(16)}`,
        );
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported architect bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const architectFallbackDecision = (
  glyphCount: number,
  stepsExecuted: number,
  reason: string,
): ArchitectPlasmidReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  plasmidAllowed: false,
  finalRole: 0,
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
  glyphCount,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateArchitectPlasmidReduction = (
  input: {
    script: Uint8Array;
    neuralCoherence: number;
    maxSteps?: number;
  },
): ArchitectPlasmidReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_ARCHITECT_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const architectTape = decodeArchitectTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, ArchitectToken>(
      architectTape.map((token) => [token.pc, token]),
    );
    const state = createArchitectInitialState(input.neuralCoherence);
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyArchitectOpcode(state, token);
      stepsExecuted++;
    }

    const branch = classifyArchitectBranch(state);
    return {
      status: "ok",
      branch,
      plasmidAllowed: branch === "emit",
      finalRole: state.role,
      signalCount: state.signalCount,
      buildCount: state.buildCount,
      branchTaken: state.branchTaken,
      glyphCount: architectTape.length,
      stepsExecuted,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return architectFallbackDecision(0, 0, message);
  }
};

export const evaluateArchitectPlasmidExecution = (
  input: {
    mode: ArchitectPlasmidExecutionMode;
    script: Uint8Array;
    neuralCoherence: number;
    legacyAllowed: boolean;
  },
): ArchitectPlasmidExecutionDecision => {
  if (!input.legacyAllowed) {
    return {
      mode: input.mode,
      legacyAllowed: false,
      allowed: false,
      status: "legacy-blocked",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  if (input.mode === "legacy-execute") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "legacy",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  const reduction = evaluateArchitectPlasmidReduction({
    script: input.script,
    neuralCoherence: input.neuralCoherence,
  });

  if (reduction.status === "fallback") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "fallback",
      branch: reduction.branch,
      finalRole: reduction.finalRole,
      signalCount: reduction.signalCount,
      buildCount: reduction.buildCount,
      branchTaken: reduction.branchTaken,
      glyphCount: reduction.glyphCount,
      stepsExecuted: reduction.stepsExecuted,
      shadowSuppressed: false,
      hybridSuppressed: false,
      fallbackReason: reduction.fallbackReason,
    };
  }

  const suppress = reduction.plasmidAllowed !== true;
  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: input.mode === "shadow-reduce" ? true : !suppress,
    status: input.mode === "shadow-reduce" ? "shadow" : "hybrid",
    branch: reduction.branch,
    finalRole: reduction.finalRole,
    signalCount: reduction.signalCount,
    buildCount: reduction.buildCount,
    branchTaken: reduction.branchTaken,
    glyphCount: reduction.glyphCount,
    stepsExecuted: reduction.stepsExecuted,
    shadowSuppressed: input.mode === "shadow-reduce" && suppress,
    hybridSuppressed: input.mode === "hybrid-reduce" && suppress,
  };
};

// --- INLINED FROM runtime_bridge/guardian_signal_hybrid.ts ---

export type GuardianSignalExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type GuardianSignalBranch = "stable" | "repair" | "unknown";

export type GuardianSignalReductionDecision = {
  status: "ok" | "fallback";
  branch: GuardianSignalBranch;
  signalAllowed: boolean;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type GuardianSignalExecutionDecision = {
  mode: GuardianSignalExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: GuardianSignalBranch;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  shadowSuppressed: boolean;
  hybridSuppressed: boolean;
  fallbackReason?: string;
};

type GuardianShadowState = {
  pc: number;
  regs: number[];
  role: number;
  neuralCoherence: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
};

type GuardianToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_GUARDIAN_MAX_STEPS = 8;
const GUARDIAN_PROP_MAP = {
  [RISC.PROP_NEURAL_COHERENCE]: true,
} as const;
const SUPPORTED_GUARDIAN_OPCODE_LENGTHS = new Map<number, number>([
  [RISC.OP_SET, 3],
  [RISC.OP_GET, 3],
  [RISC.OP_SUB, 3],
  [RISC.OP_JNZ, 3],
  [RISC.OP_JMP, 2],
  [RISC.OP_SIGNAL, 1],
  [RISC.OP_ROLE, 3],
  [RISC.OP_BUILD, 3],
  [RISC.OP_JZ, 3],
  [RISC.OP_SPORE_DRIVE, 1],
  [RISC.OP_SYSCALL, 1],
]);

export const normalizeGuardianSignalExecutionMode = (
  raw: string | undefined,
): GuardianSignalExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createGuardianInitialState = (
  neuralCoherence: number,
): GuardianShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  role: 0,
  neuralCoherence: Math.max(0, Math.floor(neuralCoherence)),
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
});

const decodeGuardianTape = (
  script: Uint8Array,
  maxTokens: number,
): GuardianToken[] => {
  const out: GuardianToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? RISC.OP_NOP;
    if (opcode === RISC.OP_NOP) break;
    const length = SUPPORTED_GUARDIAN_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(`unsupported_guardian_opcode_0x${opcode.toString(16)}`);
    }
    out.push({
      pc,
      opcode,
      length,
      args: Array.from(script.slice(pc + 1, pc + length)),
    });
    pc += length;
    steps++;
  }
  return out;
};

const classifyGuardianBranch = (
  state: GuardianShadowState,
): GuardianSignalBranch => {
  if (
    state.buildCount > 0 ||
    state.role === STATE_MATRIX.ROLE_ARCHITECT ||
    state.branchTaken
  ) {
    return "repair";
  }
  if (
    state.signalCount > 0 &&
    state.role === STATE_MATRIX.ROLE_GUARDIAN &&
    !state.branchTaken
  ) {
    return "stable";
  }
  return "unknown";
};

const applyGuardianOpcode = (
  state: GuardianShadowState,
  token: GuardianToken,
): void => {
  switch (token.opcode) {
    case RISC.OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (!(prop in GUARDIAN_PROP_MAP)) {
        throw new Error(`unsupported GET prop=${prop}`);
      }
      state.regs[reg] = state.neuralCoherence;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SET: {
      const reg = token.args[0] ?? 0;
      state.regs[reg] = token.args[1] ?? 0;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SUB: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case RISC.OP_JNZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.branchTaken = true;
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case RISC.OP_JZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) === 0) {
        state.branchTaken = true;
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case RISC.OP_JMP: {
      state.pc = token.args[0] ?? 0;
      return;
    }
    case RISC.OP_ROLE: {
      const mode = token.args[0] ?? 0;
      const role = token.args[1] ?? 0;
      if (mode === 0) state.role = role;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SIGNAL: {
      state.signalCount++;
      state.pc += token.length;
      return;
    }
    case RISC.OP_BUILD: {
      state.buildCount++;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SPORE_DRIVE: {
      // Movement is no-op in bridge reduction
      state.pc += token.length;
      return;
    }
    case RISC.OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS.YIELD) {
        // no-op
      } else if (sysId === SYS.SET_ROLE) {
        state.role = state.regs[1] ?? 0;
      } else {
        throw new Error(
          `unsupported guardian bridge syscall=0x${sysId.toString(16)}`,
        );
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported guardian bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const guardianFallbackDecision = (
  glyphCount: number,
  stepsExecuted: number,
  reason: string,
): GuardianSignalReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  signalAllowed: false,
  finalRole: 0,
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
  glyphCount,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateGuardianSignalReduction = (
  input: {
    script: Uint8Array;
    neuralCoherence: number;
    maxSteps?: number;
  },
): GuardianSignalReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_GUARDIAN_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const guardianTape = decodeGuardianTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, GuardianToken>(
      guardianTape.map((token) => [token.pc, token]),
    );
    const state = createGuardianInitialState(input.neuralCoherence);
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyGuardianOpcode(state, token);
      stepsExecuted++;
    }

    const branch = classifyGuardianBranch(state);
    return {
      status: "ok",
      branch,
      signalAllowed: branch === "stable",
      finalRole: state.role,
      signalCount: state.signalCount,
      buildCount: state.buildCount,
      branchTaken: state.branchTaken,
      glyphCount: guardianTape.length,
      stepsExecuted,
    };
  } catch (err) {
    return guardianFallbackDecision(0, 0, String(err));
  }
};

export const evaluateGuardianSignalExecution = (
  input: {
    mode: GuardianSignalExecutionMode;
    script: Uint8Array;
    neuralCoherence: number;
    legacyAllowed: boolean;
    maxSteps?: number;
  },
): GuardianSignalExecutionDecision => {
  if (!input.legacyAllowed) {
    return {
      mode: input.mode,
      legacyAllowed: false,
      allowed: false,
      status: "legacy-blocked",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  if (input.mode === "legacy-execute") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "legacy",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  const reduction = evaluateGuardianSignalReduction({
    script: input.script,
    neuralCoherence: input.neuralCoherence,
    maxSteps: input.maxSteps,
  });

  if (reduction.status === "fallback") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "fallback",
      branch: reduction.branch,
      finalRole: reduction.finalRole,
      signalCount: reduction.signalCount,
      buildCount: reduction.buildCount,
      branchTaken: reduction.branchTaken,
      glyphCount: reduction.glyphCount,
      stepsExecuted: reduction.stepsExecuted,
      shadowSuppressed: false,
      hybridSuppressed: false,
      fallbackReason: reduction.fallbackReason,
    };
  }

  if (input.mode === "shadow-reduce") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "shadow",
      branch: reduction.branch,
      finalRole: reduction.finalRole,
      signalCount: reduction.signalCount,
      buildCount: reduction.buildCount,
      branchTaken: reduction.branchTaken,
      glyphCount: reduction.glyphCount,
      stepsExecuted: reduction.stepsExecuted,
      shadowSuppressed: !reduction.signalAllowed,
      hybridSuppressed: false,
    };
  }

  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: reduction.signalAllowed,
    status: "hybrid",
    branch: reduction.branch,
    finalRole: reduction.finalRole,
    signalCount: reduction.signalCount,
    buildCount: reduction.buildCount,
    branchTaken: reduction.branchTaken,
    glyphCount: reduction.glyphCount,
    stepsExecuted: reduction.stepsExecuted,
    shadowSuppressed: false,
    hybridSuppressed: !reduction.signalAllowed,
  };
};

// --- INLINED FROM runtime_bridge/replication_hybrid.ts ---

export type ReplicationExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type ReplicationBranch = "emit" | "suppress" | "unknown";

export type ReplicationReductionDecision = {
  status: "ok" | "fallback";
  branch: ReplicationBranch;
  replicationAllowed: boolean;
  replicationCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type ReplicationExecutionDecision = {
  mode: ReplicationExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: ReplicationBranch;
  replicationCount: number;
  shadowSuppressed: boolean;
  hybridSuppressed: boolean;
  fallbackReason?: string;
};

export type ReplicationHybridState = {
  mode: ReplicationExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  allowedReplications: number;
  suppressedReplications: number;
  shadowSuppressedReplications: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "emit"
    | "suppress"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: ReplicationBranch;
  lastFallbackReason: string;
  lastMode?: ReplicationExecutionMode;
};

type ReplicationShadowState = {
  pc: number;
  regs: number[];
  energy: number;
  resonance: number;
  aggression: number;
  replicationCount: number;
};

type ReplicationToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_REPLICATION_MAX_STEPS = 16;
const REPLICATION_PROP_MAP = {
  [RISC.PROP_ENERGY]: true,
  [RISC.PROP_RESONANCE]: true,
} as const;

const SUPPORTED_REPLICATION_OPCODE_LENGTHS = new Map<number, number>([
  [RISC.OP_SET, 3],
  [RISC.OP_GET, 3],
  [RISC.OP_SUB, 3],
  [RISC.OP_ADD, 3],
  [RISC.OP_JNZ, 3],
  [RISC.OP_JZ, 3],
  [RISC.OP_JMP, 2],
  [RISC.OP_REPLICATE, 1],
  [RISC.OP_PUT, 3],
]);

export const normalizeReplicationExecutionMode = (
  raw: string | undefined,
): ReplicationExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createReplicationInitialState = (
  energy: number,
  resonance: number,
  aggression: number,
): ReplicationShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  energy,
  resonance,
  aggression,
  replicationCount: 0,
});

const decodeReplicationTape = (
  script: Uint8Array,
  maxTokens: number,
): ReplicationToken[] => {
  const out: ReplicationToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? RISC.OP_NOP;
    if (opcode === RISC.OP_NOP) break;
    const length = SUPPORTED_REPLICATION_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(
        `unsupported_replication_opcode_0x${opcode.toString(16)}`,
      );
    }
    out.push({
      pc,
      opcode,
      length,
      args: Array.from(script.slice(pc + 1, pc + length)),
    });
    pc += length;
    steps++;
  }
  return out;
};

const applyReplicationOpcode = (
  state: ReplicationShadowState,
  token: ReplicationToken,
): void => {
  switch (token.opcode) {
    case RISC.OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (prop === RISC.PROP_ENERGY) state.regs[reg] = state.energy;
      else if (prop === RISC.PROP_RESONANCE) state.regs[reg] = state.resonance;
      else if (!(prop in REPLICATION_PROP_MAP)) {
        // We only allow energy and resonance in this slit for now
        throw new Error(`unsupported GET prop=${prop}`);
      }
      state.pc += token.length;
      return;
    }
    case RISC.OP_SET: {
      const reg = token.args[0] ?? 0;
      state.regs[reg] = token.args[1] ?? 0;
      state.pc += token.length;
      return;
    }
    case RISC.OP_SUB: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case RISC.OP_ADD: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) + (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case RISC.OP_PUT: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      const val = state.regs[reg] ?? 0;
      if (prop === RISC.PROP_ENERGY) state.energy = val;
      else if (prop === RISC.PROP_RESONANCE) state.resonance = val;
      state.pc += token.length;
      return;
    }
    case RISC.OP_JNZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case RISC.OP_JZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) === 0) {
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case RISC.OP_JMP: {
      state.pc = token.args[0] ?? 0;
      return;
    }
    case RISC.OP_REPLICATE: {
      const aggrH = state.aggression;
      const eThresh = 50 - (aggrH >> 3);
      const rThresh = 10 - (aggrH >> 5);
      if (state.energy > eThresh && state.resonance > rThresh) {
        state.replicationCount++;
        state.energy = state.energy >> 1;
        state.resonance = state.resonance + 30;
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported replication bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const replicationFallbackDecision = (
  stepsExecuted: number,
  reason: string,
): ReplicationReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  replicationAllowed: true, // Fail-open for replication safety
  replicationCount: 0,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateReplicationReduction = (
  input: {
    script: Uint8Array;
    energy: number;
    resonance: number;
    aggression: number;
    maxSteps?: number;
  },
): ReplicationReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_REPLICATION_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const replicationTape = decodeReplicationTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, ReplicationToken>(
      replicationTape.map((token) => [token.pc, token]),
    );
    const state = createReplicationInitialState(
      input.energy,
      input.resonance,
      input.aggression,
    );
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyReplicationOpcode(state, token);
      stepsExecuted++;
    }

    const branch: ReplicationBranch = state.replicationCount > 0
      ? "emit"
      : "suppress";
    return {
      status: "ok",
      branch,
      replicationAllowed: branch === "emit",
      replicationCount: state.replicationCount,
      stepsExecuted,
    };
  } catch (err) {
    return replicationFallbackDecision(0, String(err));
  }
};

export const evaluateReplicationExecution = (
  input: {
    mode: ReplicationExecutionMode;
    script: Uint8Array;
    energy: number;
    resonance: number;
    aggression: number;
    legacyAllowed: boolean;
    maxSteps?: number;
  },
): ReplicationExecutionDecision => {
  if (!input.legacyAllowed) {
    return {
      mode: input.mode,
      legacyAllowed: false,
      allowed: false,
      status: "legacy-blocked",
      branch: "unknown",
      replicationCount: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  if (input.mode === "legacy-execute") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "legacy",
      branch: "unknown",
      replicationCount: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  const reduction = evaluateReplicationReduction({
    script: input.script,
    energy: input.energy,
    resonance: input.resonance,
    aggression: input.aggression,
    maxSteps: input.maxSteps,
  });

  if (reduction.status === "fallback") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "fallback",
      branch: reduction.branch,
      replicationCount: reduction.replicationCount,
      shadowSuppressed: false,
      hybridSuppressed: false,
      fallbackReason: reduction.fallbackReason,
    };
  }

  if (input.mode === "shadow-reduce") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "shadow",
      branch: reduction.branch,
      replicationCount: reduction.replicationCount,
      shadowSuppressed: !reduction.replicationAllowed,
      hybridSuppressed: false,
    };
  }

  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: reduction.replicationAllowed,
    status: "hybrid",
    branch: reduction.branch,
    replicationCount: reduction.replicationCount,
    shadowSuppressed: false,
    hybridSuppressed: !reduction.replicationAllowed,
  };
};
