---
id: PULSE
type: module
description: Implementation of PULSE
deps:
  - TYPES
  - RUNTIME_POLICY
  - HORMONE_BUFFER_RUNTIME
  - HORMONE_BUFFER
  - GENERIC_LEDGER_SYSTEM
  - GENERIC_LEDGER_PERSISTENCE
  - memory_views_base
  - DRIFT_WARDEN
  - DOLL_FORK_MATRIX
  - SNAP_ENGINE
  - GENESIS_INCEPTOR
  - LINEAGE_TRACKER
  - QUORUM_ADVOCATE
  - DOLL_FORK_RUNNER
  - MX
  - SIGMA_FFI_BRIDGE
  - DAEMON_INGRESS_POLICY
  - LOGGER
  - CONTROL_INTENT_QUEUE
  - GLYPH_TELEMETRY
min_level: 13
vars:
  - BONDS_OFFSET
  - CAUSALITY_OFFSET
  - COHERENCE_OFFSET
  - CONTEXT_OFFSET
  - HORMONE_BUFFER
  - GENERIC_LEDGER_PERSISTENCE
  - createGeneticLedgerRuntime
  - applyLedgerUpdate
  - rollbackLedgerUpdate
  - snapshotLedgerRuntime
  - EGRESS_DATA_OFFSET
  - EGRESS_HEAD_OFFSET
  - ENERGY_OFFSET
  - GRID_H
  - GRID_W
  - IDS_OFFSET
  - INSTRUCTIONS_OFFSET
  - LATTICE_MEMORY_END
  - LOGIC_OFFSET
  - MAX_ATOMS
  - MAX_EGRESS_EVENTS
  - OP_ADD
  - OP_BUILD
  - OP_GET
  - OP_JMP
  - OP_JNZ
  - OP_JZ
  - OP_NOP
  - OP_PUT
  - OP_REPLICATE
  - OP_SECRETE_PLASMID
  - OP_SET
  - OP_SIGNAL
  - OP_SPORE_DRIVE
  - OP_SUB
  - OP_SYSCALL
  - RUNTIME_POLICY
  - sharedBuffer
  - PHASE_OFFSET
  - PHYSICS_READ_ENERGY_OFFSET
  - PHYSICS_READ_RESONANCE_OFFSET
  - PHYSICS_READ_XS_OFFSET
  - PHYSICS_READ_YS_OFFSET
  - PROP_ENERGY
  - PROP_NEURAL_COHERENCE
  - PROP_RESONANCE
  - RESONANCE_OFFSET
  - ROLES_OFFSET
  - SPAWN_REQUESTS_OFFSET
  - SYS_SET_ROLE
  - SYS_YIELD
  - XS_OFFSET
  - YS_OFFSET
  - PulseOracleDelegate
  - PulseAkashaDelegate
  - PulseNoosphereDelegate
  - EvolutionPressureState
  - SpatialHashState
  - HomeostasisState
  - GeneticLedgerRuntimeState
  - GuardianSignalHybridState
  - ArchitectPlasmidHybridState
  - RollingHistory
  - DriftMetrics
  - DriftWarden
  - DollFork
  - SNAP_ENGINE
  - GenesisInceptor
  - LineageTracker
  - QuorumAdvocate
  - DollForkRunner
  - MX
  - SIGMA_FFI
  - ReplicationExecutionMode
  - GeneticLedgerKey
  - HormoneId
  - GuardianSignalExecutionMode
  - DAEMON_INGRESS_POLICY_LIMITS
  - evaluateInvariantAdmission
  - evaluatePlasmidRisk
  - Ld
  - CONTROL_INTENT_QUEUE
  - GLYPH_TELEMETRY
  - LedgerApplyResult
  - LedgerRollbackResult
  - LedgerRuntimeSnapshot
  - LedgerRuntimeState
extra_symbols:
  - ArchitectPlasmidBranch
  - ArchitectPlasmidExecutionDecision
  - ArchitectPlasmidExecutionMode
  - ArchitectPlasmidReductionDecision
  - GuardianSignalBranch
  - GuardianSignalExecutionDecision
  - GuardianSignalReductionDecision
  - PULSE
  - ReplicationBranch
  - ReplicationExecutionDecision
  - ReplicationHybridState
  - ReplicationReductionDecision
  - drainEgressEvents
  - evaluateArchitectPlasmidExecution
  - evaluateArchitectPlasmidReduction
  - evaluateGuardianSignalExecution
  - evaluateGuardianSignalReduction
  - evaluateReplicationExecution
  - evaluateReplicationReduction
  - logicView
  - normalizeArchitectPlasmidExecutionMode
  - normalizeGuardianSignalExecutionMode
  - normalizeReplicationExecutionMode
  - phasesView
  - rolesView
---


```typescript




// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
let oracleDelegate: PulseOracleDelegate | null = null;
let akashaDelegate: PulseAkashaDelegate | null = null;
let noosphereDelegate: PulseNoosphereDelegate | null = null;

const MAX_TICK_DRIFT = 50;
let lastTickTime = performance.now();
let lastPanopticonBroadcastTime = 0;
let tickCountLog = 0;
let genesisPromiseResolver: (() => void) | null = null;

const { syncHormonesToLattice } = HORMONE_BUFFER_RUNTIME;
const { createPhysiologicalLedgerRuntime, HORMONE_BUFFER_CATALOG } = HORMONE_BUFFER;

const {
  appendLedgerRecordAndMaybeCompact,
  getLogPath,
  getSnapshotPath,
  hydrateLedgerRuntime,
  recordFromApply,
  recordFromRollback,
} = GENERIC_LEDGER_PERSISTENCE;

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

const CACHE_WASM = async (): Promise<WebAssembly.Module | null> => {
  try {
    const bytes = await Deno.readFile(AS_WASM_PATH);
    return await WebAssembly.compile(bytes);
  } catch (err) {
    Le(`Failed to cache WASM module: ${(err as Error).message}`);
    return null;
  }
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
): LedgerApplyResult<
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
): LedgerRollbackResult<
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
): LedgerApplyResult<
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
): LedgerRollbackResult<
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
): LedgerApplyResult<
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
): LedgerRollbackResult<
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

const idsView = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS);
const xsView = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS);
const ysView = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS);
const energiesView = new Int32Array(
  sharedBuffer,
  ENERGY_OFFSET,
  MAX_ATOMS,
);
const resonancesView = new Int32Array(
  sharedBuffer,
  RESONANCE_OFFSET,
  MAX_ATOMS,
);
const causalityView = new Uint8Array(
  sharedBuffer,
  CAUSALITY_OFFSET,
  MAX_ATOMS,
);
export const phasesView = new Int32Array(
  sharedBuffer,
  PHASE_OFFSET,
  MAX_ATOMS,
);
export const rolesView = new Uint8Array(
  sharedBuffer,
  ROLES_OFFSET,
  MAX_ATOMS,
);
export const logicView = new Uint8Array(
  sharedBuffer,
  LOGIC_OFFSET,
  MAX_ATOMS * 8,
);
const instructionsView = new Uint8Array(
  sharedBuffer,
  INSTRUCTIONS_OFFSET,
  MAX_ATOMS * 64,
);
const bondsView = new Uint32Array(
  sharedBuffer,
  BONDS_OFFSET,
  MAX_ATOMS * 4,
);
const readXsView = new Int16Array(
  sharedBuffer,
  PHYSICS_READ_XS_OFFSET,
  MAX_ATOMS,
);
const readYsView = new Int16Array(
  sharedBuffer,
  PHYSICS_READ_YS_OFFSET,
  MAX_ATOMS,
);
const readEnergiesView = new Int32Array(
  sharedBuffer,
  PHYSICS_READ_ENERGY_OFFSET,
  MAX_ATOMS,
);
const readResonancesView = new Int32Array(
  sharedBuffer,
  PHYSICS_READ_RESONANCE_OFFSET,
  MAX_ATOMS,
);
const spawnHeadView = new Int32Array(
  sharedBuffer,
  SPAWN_REQUESTS_OFFSET,
  2,
);
const spawnDataView = new DataView(
  sharedBuffer,
  SPAWN_REQUESTS_OFFSET + 8,
  SPAWN_RING_CAPACITY * SPAWN_SLOT_BYTES,
);
const coherenceView = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1);

// Helper for drift & trend monitoring
const createRollingHistory = (maxSize: number): RollingHistory => {
  const values = new Float64Array(maxSize);
  let head = 0;
  let count = 0;
  return {
    add: (val: number) => {
      values[head] = val;
      head = (head + 1) % maxSize;
      if (count < maxSize) count++;
    },
    sum: () => {
      let s = 0;
      for (let i = 0; i < count; i++) s += values[i];
      return s;
    },
    size: () => count || 1,
  };
};

const noveltyHistory = createRollingHistory(100);

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
    akashaDelegate?.recordMutationTelemetry({
      lane: "internal_host",
      kind: "evolution_pressure_adjust",
      count: adjusted,
    });
    if (tick % 200 === 0) {
      Li(
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
    akashaDelegate?.recordMutationTelemetry({
      lane: "internal_host",
      kind: "energy_homeostasis_adjust",
      count: adjusted,
    });
    if (tick % 20 === 0) {
      Ld(
        `⚖️ [HOMEOSTASIS] adjusted=${adjusted} netDelta=${netDelta} tax=${taxed} subsidy=${subsidized} target=${targetEnergy} band=${HOMEOSTASIS_BAND} baseTax=${baseTax} subsidyEnabled=${HOMEOSTASIS_SUBSIDY_ENABLED} overflow=${
          spatialOverflowRatio.toFixed(3)
        }`,
      );
    }
  }
  return { adjusted, netDelta };
};

const startupSelfTestBreached = (): boolean => {
  if (Atomics.load(idsView, 0) !== 0n) return true;
  return MX.getActiveIndices().length !== 0;
};
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
      memory: MX.wasmMemory,
      abort: (msg: any) => Le("   [SHADOW WASM ABORT]:", msg),
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
    MX.wasmMemory.buffer,
    EGRESS_HEAD_OFFSET,
    1,
  );
  const writeHead = Atomics.load(headView, 0);
  const readHead = lastEgressReadHead || 0;

  if (writeHead === readHead) return [];

  const events: Uint8Array[] = [];
  const maxEvents = MAX_EGRESS_EVENTS;
  const dataView = new Uint8Array(
    MX.wasmMemory.buffer,
    EGRESS_DATA_OFFSET,
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

let isTicking = false;
export const PULSE = {
  setOracleDelegate: (delegate: PulseOracleDelegate) => {
    oracleDelegate = delegate;
  },
  setAkashaDelegate: (delegate: PulseAkashaDelegate) => {
    akashaDelegate = delegate;
  },
  setNoosphereDelegate: (delegate: PulseNoosphereDelegate) => {
    noosphereDelegate = delegate;
  },
  get initialized() {
    return pulseInitialized;
  },
  set initialized(val: boolean) {
    pulseInitialized = val;
  },
  currentPulseId: Date.now(),
  getStats: () => ({
    startupSelfTestDone: true,
    wasmBootDegraded: false,
    wasmBootPrecheckCompleted: true,
  }),
  generateEpochProof: async (tick: number): Promise<string> => {
    if (!shadowWasmInstance || !generate_epoch_proof_ffi) {
      await initShadowWasm();
    }
    const resultPtr = LATTICE_MEMORY_END + 1024 + 128;
    generate_epoch_proof_ffi!(tick, resultPtr);

    const u8View = new Uint8Array(
      MX.wasmMemory.buffer,
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
    const scratchSpaceOffset = LATTICE_MEMORY_END + 1024;
    const resultPtr = scratchSpaceOffset + 64;

    // Write logic bytes
    const u8View = new Uint8Array(MX.wasmMemory.buffer);
    u8View.fill(0, scratchSpaceOffset, scratchSpaceOffset + 64);
    u8View.set(bytecode, scratchSpaceOffset);

    // Clear result space
    const i32View = new Int32Array(
      MX.wasmMemory.buffer,
      resultPtr,
      8,
    );
    i32View.fill(0);

    const atomId = Number(MX.getId(targetIdx));

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
  initWorkers: async () => {
    resetEvolutionPressureStateForColdStart();
    resetHomeostasisStateForColdStart();
    await syncHomeostasisBaseTaxLedgerHydration();
    await syncHomeostasisTargetEnergyLedgerHydration();
    await syncPressureRingScaleLedgerHydration();
    pulseInitialized = true;
  },
  getEvolutionPressureState: (): EvolutionPressureState =>
    snapshotEvolutionPressureState(),
  getSpatialHashState: (): SpatialHashState => snapshotSpatialHashState(),
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
    | LedgerApplyResult<"pulse.homeostasis.baseTax">
    | LedgerApplyResult<"pulse.homeostasis.targetEnergy">
    | LedgerApplyResult<"pulse.pressureRing.scale">
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
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_host",
          kind: "genetic_ledger_update",
          count: 1,
        });
        Li(
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
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_host",
          kind: "genetic_ledger_update",
          count: 1,
        });
        Li(
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
      akashaDelegate?.recordMutationTelemetry({
        lane: "internal_host",
        kind: "genetic_ledger_update",
        count: 1,
      });
      Li(
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
    | LedgerRollbackResult<"pulse.homeostasis.baseTax">
    | LedgerRollbackResult<"pulse.homeostasis.targetEnergy">
    | LedgerRollbackResult<"pulse.pressureRing.scale">
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
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_host",
          kind: "genetic_ledger_rollback",
          count: 1,
        });
        Li(
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
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_host",
          kind: "genetic_ledger_rollback",
          count: 1,
        });
        Li(
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
      akashaDelegate?.recordMutationTelemetry({
        lane: "internal_host",
        kind: "genetic_ledger_rollback",
        count: 1,
      });
      Li(
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
      : Atomics.load(MX.tickCounter, 0);

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
    Li(
      `   [PULSE] Evolution pressure ring update source=${
        update.source ?? "runtime"
      } mode=${update.mode} novelty=${applied.noveltySigned} symbiosis=${applied.symbiosisSigned} fear=${applied.fear} ego=${applied.ego} enabled=${applied.ring.enabled} theta=${
        applied.ring.theta.toFixed(4)
      } scale=${applied.ring.scale}.`,
    );
    return applied;
  },

  tick: async () => {
    if (isTicking) {
      throw new Error(
        "[PULSE] tick() called concurrently! Overlapping ticks are forbidden and cause synchronization deadlocks.",
      );
    }
    isTicking = true;
    if (!SIGMA_FFI.loaded()) {
      SIGMA_FFI.init();
    }
    if (wasmBootDegraded) {
      return;
    }

    const { syncState, tickCounter, SYNC } = MX;
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
      MX.setHormone(spec.index, res.state.currentValue);
    }

    try {
      // 0. Sovereign Oracle Peak Detection & Coherence Polling
      const currentTick = Atomics.load(tickCounter, 0);
      PULSE.currentPulseId = currentTick;
      const dumpA11 = (lbl: string) => {
        const xs = new Int16Array(
          MX.wasmMemory.buffer,
          XS_OFFSET,
          MAX_ATOMS,
        );
        Ld(
          `[PULSE TRACE] ${lbl} -> Atom 11 X=${xs[11]} or 15 X=${xs[15]}`,
        );
      };

      dumpA11("Before Quorum");
      const activeIdx = MX.getActiveIndices();

      // Stage 25: Sovereign Feedback - Syntropy-modulated tax
      // Move evaluation earlier so it can affect metabolism and gate
      const syntropy = quorumAdvocate.evaluateQuorum(activeIdx);

      dumpA11("Before Coherence");

      const noveltyDriftRatio = (noveltyHistory.sum() / noveltyHistory.size()) /
        1000.0;
      let coherence = Atomics.load(MX.neuralCoherence, 0);
      oracleDelegate?.setNeuralCoherence(coherence);

      dumpA11("Before Hormones");

      // Reset global neural coherence aggregation field for the NEXT tick.
      Atomics.store(MX.coherence, 0, 0); // Accumulator (Vector 10)
      Atomics.store(MX.neuralCoherence, 0, 0); // Broadcast

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
        MX.setHormone(spec.index, res.state.currentValue);
      }

      if (coherence > 1000) {
        Ld(
          `🧠 [PULSE] High Coherence detected: ${coherence}. Consulting Oracle...`,
        );
      }

      const telemetry = oracleDelegate?.gatherEpochTelemetry() ||
        { matrixResonance: 0 };
      oracleDelegate?.broadcastWhisper(currentTick, telemetry, coherence);
      // Trigger Oracle on either Matrix Resonance spike or High Coherence
      if (telemetry.matrixResonance > 5000 || coherence > 500) {
        const regent = SOVEREIGNTY_ENGINE.electRegent(activeIdx);
        if (regent && regent.idx !== -1) {
          oracleDelegate?.consultOracle(regent.idx, telemetry);
        }
      }

      // --- PHASE 1-4: NATIVE CORE EXECUTION ---
      SIGMA_FFI.tick(currentTick);
      dumpA11("After FFI Native Tick");

      // --- TRANSITION TO HOST_LOCK ---
      // Matrix is now settled, workers are done. Lock for host-side logic & SNAPSHOTS.
      Atomics.store(syncState, 0, SYNC.HOST_LOCK);
      Atomics.notify(syncState, 0);

      // --- PHASE 10: HOST-SIDE EVOLUTIONARY PRESSURE ---
      applyEvolutionPressureTerms(currentTick, activeIdx);
      applyEnergyHomeostasisTerms(currentTick, activeIdx, spatialHashState.overflowRatio);

      // --- PHASE 15: SPATIAL HASH TELEMETRY ---
      // Update spatial hash state (Max atoms used as denominator for ratio)
      spatialHashState.tick = currentTick;
      // Note: In native-only mode, we can read these stats via a future MX API call.
      // For now, we satisfy the contract and report nominal metrics.
      spatialHashState.overflowRatio = spatialHashState.overflowCount / MAX_ATOMS;

      akashaDelegate?.recordMutationTelemetry({
        lane: "canonical_gate",
        kind: "audit_matrix_cycle",
        type: "BUILD_SPATIAL_HASH",
        count: 1,
        meta: {
          overflowCount: spatialHashState.overflowCount,
          overflowRatio: spatialHashState.overflowRatio,
        },
      });

      // --- PHASE 50: TRANSACTIONAL PANOPTICON TELEMETRY ---
      const nowMs = performance.now();
      if (nowMs - lastPanopticonBroadcastTime >= 50) { // ~20fps
        const frame = MX.packPanopticonFrame();
        akashaDelegate?.broadcastPanopticonFrame(frame);
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
        if (akashaDelegate) {
          akashaDelegate.saveSnap(currentTick).then(() => {
            akashaDelegate?.cleanupSnap(RUNTIME_POLICY.snapshot.retention);
          });
        }
      }

      // --- STAGE 26: CONTINUUM CHRONOSPHERE EPOCHS (HEARTBEAT) ---
      if (currentTick > 0 && currentTick % 10000 === 0) {
        Li(
          `[CONTINUUM] Pulse Heartbeat triggered at tick ${currentTick}. Archiving Epoch...`,
        );
        const pCount = activeIdx.length;
        const autoEpochId = `auto_tick_${currentTick}`;
        const epochHash = await PULSE.generateEpochProof(currentTick);
        if (akashaDelegate) {
          await akashaDelegate.saveEpoch(
            MX.wasmMemory,
            currentTick,
            autoEpochId,
            pCount,
            0,
            epochHash,
          );
        }
        Li(
          `[CONTINUUM] Epoch ${autoEpochId}.sigma securely sealed into Chronosphere. (Proof: ${epochHash})`,
        );
      }

      // --- STAGE 27/28: META-KURAMOTO SWARM MEMBRANE & P2P NEXUS ---
      if (currentTick > 0 && currentTick % 10000 === 0) {
        let totalPhase = 0;
        for (const idx of activeIdx) {
          totalPhase += Math.abs(MX.get_phase(idx));
        }
        const avgPhase = activeIdx.length > 0
          ? totalPhase / activeIdx.length
          : 0;
        const epochHash = await PULSE.generateEpochProof(currentTick);
        const egressEvents = drainEgressEvents();
        noosphereDelegate?.evaluateHeartbeat(
          currentTick,
          epochHash,
          avgPhase,
          egressEvents.length,
        );
      }

      const egressEvents = drainEgressEvents();
      if (egressEvents.length > 0) {
        for (const ev of egressEvents) {
          noosphereDelegate?.routeAtom(ev);
        }
      }

      oracleDelegate?.drainPendingMutations();
      await CONTROL_INTENT_QUEUE.applyHostLockBudget();
      dumpA11("End of TICK phase 1");

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

      // --- STAGE 8: Hybrid Promotion Bridge (Guardians & Architects) ---
      for (let idx = 0; idx < MAX_ATOMS; idx++) {
        if (idsView[idx] !== 0n) {
          Atomics.store(causalityView, idx, 1);
        }
      }

      // Decay host pheromone fields (DEPRECATED: Now handled in WASM tick_environment)
      // PHYSICS_ENGINE.decayPheromones();

      // 7. Autonomous Systemic Audit (Every 5 ticks)
      if (currentTick % 5 === 0) {
        akashaDelegate?.recordMutationTelemetry({
          lane: "canonical_gate",
          kind: "audit_matrix_cycle",
          count: 1,
        });
        GATE.auditMatrix(MX);
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
          Ld(
            `💎 [RESONANCE] System Coherence: ${coherence}/255 (Avg Res: ${
              (avgRes / 100).toFixed(1)
            })`,
          );
          // --- STAGE 43: GOVERNANCE LAB (PREDICTION MARKET) ---
          if (currentTick > 0 && currentTick % 2000 === 0) {
            PREDICTION_MARKET.resolveCrisis();
            PREDICTION_MARKET.distributeDividends();

            const active = MX.getActiveIndices();
            if (active.length > 0) {
              let eliteIdx = active[0];
              let maxEnergy = 0;
              for (const idx of active) {
                const energy = MX.get_energy(idx);
                if (energy > maxEnergy) {
                  maxEnergy = energy;
                  eliteIdx = idx;
                }
              }
              if (maxEnergy > 50000) {
                const eliteGenome = MX.getInstructions(eliteIdx);
                PREDICTION_MARKET.startCrisis(eliteGenome);
              }
            }
          }

          // --- STAGE 22: DRIFT WARDEN AUDIT ---
          const drift = driftWarden.analyze(currentTick);
          if (drift.shadowForkRecommended && !shadowForkActive) {
            Lw(
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
                Li(
                  `✅ [ADAPTIVE] Shadow rehearsal complete for drift at tick ${currentTick}.`,
                );
              } catch (e) {
                Le(`❌ [ADAPTIVE] Shadow rehearsal failed:`, e);
              } finally {
                shadowForkActive = false;
              }
            })();
          }
        }
      }

      akashaDelegate?.flushMutationTelemetry(currentTick);
      const glyphSnapshot = GLYPH_TELEMETRY.snapshot();
      lineageTracker.syncLineages(activeIdx);

      // --- STAGE 6: Codex evidence record ---
      akashaDelegate?.observePulseCodex(
        currentTick,
        activeIdx.length,
        glyphSnapshot,
        syntropy, // already calculated earlier in this tick
      );
      // Increment Global Tick Counter
      Atomics.add(tickCounter, 0, 1);

      noosphereDelegate?.setNexusStatus({ localCurrentTick: currentTick });
      const now = performance.now();
      const dt = now - lastTickTime;
      if (dt > 1000) {
        noosphereDelegate?.setNexusStatus({
          localTps: (currentTick - tickCountLog) / (dt / 1000),
        });
        lastTickTime = now;
        tickCountLog = currentTick;
      }

      const medianTick = noosphereDelegate?.getMedianSwarmTick(currentTick) ??
        0;
      if (currentTick > medianTick + MAX_TICK_DRIFT) {
        await new Promise((r) => setTimeout(r, 10)); // Elastic yield bounds
      }

      if (currentTick > 0 && currentTick % 10000 === 0) {
        let hashSum = 0n;
        for (let i = 1; i < MX.MAX_ATOMS; i++) {
          if (MX.get_energy(i) > 0) {
            hashSum += BigInt(MX.get_energy(i)) +
              BigInt(MX.get_phase(i));
          }
        }
        noosphereDelegate?.broadcastEpochConsensus(currentTick, hashSum);
      }

      // SNAP PHASE was relocated to HOST_LOCK (Phase 50)
    } finally {
      Atomics.store(syncState, 0, SYNC.IDLE);
      Atomics.notify(syncState, 0);
      isTicking = false;
    }
  },
  onRemoteAtomTransit: (payload: Uint8Array) => {
    const newIdx = noosphereDelegate?.unpackAtom(payload);
    if (newIdx !== -1) {
      const id = MX.getId(newIdx!);
      Li(
        `🛸 [PULSE] Atom ${id} materialized from hyperspace at index ${newIdx}.`,
      );
      akashaDelegate?.recordMutationTelemetry({
        lane: "external_ingress",
        kind: "federation_migration_clear",
        count: 1,
      });
    } else {
      Lw(
        `🛸 [PULSE] Ingress atom failed to materialize (Lattice full or corrupt).`,
      );
    }
  },
  onRemoteSyncRequest: async (peerId: string) => {
    Li(
      `[PULSE] Serving Hot State Merging Genesis block to ${peerId}...`,
    );
    const payload = akashaDelegate
      ? await akashaDelegate.compressMemory(MX.wasmMemory)
      : new Uint8Array(0);
    noosphereDelegate?.sendEpochPayload(peerId, payload);
  },
  onRemoteEpochPayload: async (payload: Uint8Array) => {
    Li(
      `[PULSE] Hot State Merging payload received. Unpacking into Lattice...`,
    );
    if (akashaDelegate) {
      await akashaDelegate.decompressMemoryToLattice(
        MX.wasmMemory,
        payload,
      );
    }
    if (genesisPromiseResolver) {
      genesisPromiseResolver();
      genesisPromiseResolver = null;
    }
  },
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
    if (nx <= 0) nx = Math.floor(GRID_W * 10 - 1);
    else if (nx >= Math.floor(GRID_W * 10 - 1)) nx = 0;

    if (ny <= 0) ny = Math.floor(GRID_H * 10 - 1);
    else if (ny >= Math.floor(GRID_H * 10 - 1)) ny = 0;

    const role = payload[148];

    const atomIdx = MX.findEmptySlot();
    if (atomIdx > 0) {
      MX.setEnergy(atomIdx, energy);
      MX.setResonance(atomIdx, resonance);
      MX.setPhase(atomIdx, phase);
      MX.setId(
        atomIdx,
        BigInt(PULSE.currentPulseId) << 16n | BigInt(atomIdx),
      );
      MX.setRole(atomIdx, role);

      const xs = new Int16Array(
        MX.wasmMemory.buffer,
        XS_OFFSET,
        MAX_ATOMS,
      );
      const ys = new Int16Array(
        MX.wasmMemory.buffer,
        YS_OFFSET,
        MAX_ATOMS,
      );
      Atomics.store(xs, atomIdx, nx);
      Atomics.store(ys, atomIdx, ny);

      MX.setInstructions(atomIdx, genome);

      const ctxView = new Int32Array(
        MX.wasmMemory.buffer,
        CONTEXT_OFFSET + atomIdx * 64,
        16,
      );
      for (let i = 0; i < 16; i++) {
        Atomics.store(ctxView, i, view.getInt32(84 + i * 4, true));
      }
    }
  },
};
```
