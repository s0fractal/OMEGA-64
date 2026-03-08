export type GoldenTraceMetricPolicy = "strict" | "bounded";

export type GoldenTraceScenario = {
  id: string;
  scenario: string;
  setup: string;
  duration: string;
  daemonEnabled: boolean;
  metrics: readonly string[];
  driftPolicy: Readonly<Record<string, GoldenTraceMetricPolicy>>;
  supportFiles: readonly string[];
};

const TRACE_ROOT = "verification/traces";

const GOLDEN_TRACE_CATALOG_DATA: GoldenTraceScenario[] = [
  {
    id: "gt01_coldstart_seeded_swarm",
    scenario: "coldstart / seeded swarm",
    setup: "cold boot, deterministic seed swarm, daemon off",
    duration: "256 ticks",
    daemonEnabled: false,
    metrics: [
      "population",
      "avgEnergy",
      "spatialOverflowRatio",
      "mutationCounts",
      "invariantDigest",
    ],
    driftPolicy: {
      population: "strict",
      avgEnergy: "bounded",
      spatialOverflowRatio: "bounded",
      mutationCounts: "strict",
      invariantDigest: "strict",
    },
    supportFiles: [
      "worker_seeded_swarm.ts",
      "worker_determinism_capture.ts",
    ],
  },
  {
    id: "gt02_free_run_no_ingress",
    scenario: "free run without external intervention",
    setup: "cold boot, no inject, no daemon policy updates",
    duration: "2048 ticks",
    daemonEnabled: false,
    metrics: [
      "population",
      "avgEnergy",
      "spatialOverflowRatio",
      "decreeShifts",
      "mutationCounts",
    ],
    driftPolicy: {
      population: "bounded",
      avgEnergy: "bounded",
      spatialOverflowRatio: "bounded",
      decreeShifts: "strict",
      mutationCounts: "strict",
    },
    supportFiles: [
      "worker_trend_baseline.ts",
      "worker_trend_math.ts",
    ],
  },
  {
    id: "gt03_pheromone_inject",
    scenario: "bounded pheromone inject",
    setup: "warmup 128 ticks, then one fixed DROP_PHEROMONE payload",
    duration: "512 ticks total",
    daemonEnabled: false,
    metrics: [
      "localResponseWindow",
      "population",
      "avgEnergy",
      "spatialOverflowRatio",
      "invariantDigest",
    ],
    driftPolicy: {
      localResponseWindow: "strict",
      population: "bounded",
      avgEnergy: "bounded",
      spatialOverflowRatio: "bounded",
      invariantDigest: "strict",
    },
    supportFiles: [
      "worker_determinism_capture.ts",
    ],
  },
  {
    id: "gt04_plasmid_inject",
    scenario: "durable symbolic ingress",
    setup: "warmup 128 ticks, then one fixed INJECT_PLASMID payload",
    duration: "512 ticks total",
    daemonEnabled: false,
    metrics: [
      "acceptedMutationCounts",
      "rejectedMutationCounts",
      "population",
      "avgEnergy",
      "codexSnapshotDigest",
      "invariantDigest",
    ],
    driftPolicy: {
      acceptedMutationCounts: "strict",
      rejectedMutationCounts: "strict",
      population: "bounded",
      avgEnergy: "bounded",
      codexSnapshotDigest: "strict",
      invariantDigest: "strict",
    },
    supportFiles: [
      "worker_resilience_capture.ts",
    ],
  },
  {
    id: "gt05_homeostasis_correction",
    scenario: "external homeostasis correction",
    setup: "warmup 256 ticks, then one fixed /api/homeostasis update",
    duration: "768 ticks total",
    daemonEnabled: false,
    metrics: [
      "avgEnergySlope",
      "spatialOverflowRatio",
      "homeostasisStateDigest",
      "mutationCounts",
    ],
    driftPolicy: {
      avgEnergySlope: "bounded",
      spatialOverflowRatio: "bounded",
      homeostasisStateDigest: "strict",
      mutationCounts: "strict",
    },
    supportFiles: [
      "worker_trend_math.ts",
    ],
  },
  {
    id: "gt06_daemon_admission_case",
    scenario: "daemon admission / rejection",
    setup:
      "one accepted ingress case and one degraded/rejected case with daemon governance on",
    duration: "event-bounded",
    daemonEnabled: true,
    metrics: [
      "admissionSeverity",
      "appliedAction",
      "codexChronicleDigest",
      "dominantInvariantDigest",
    ],
    driftPolicy: {
      admissionSeverity: "strict",
      appliedAction: "strict",
      codexChronicleDigest: "strict",
      dominantInvariantDigest: "strict",
    },
    supportFiles: [
      "test_daemon_governance_contract.ts",
    ],
  },
  {
    id: "gt07_daemon_policy_block",
    scenario: "daemon policy block",
    setup:
      "warmup 128 ticks, then one fixed INJECT_PLASMID payload with a blocked opcode",
    duration: "256 ticks total",
    daemonEnabled: true,
    metrics: [
      "httpStatus",
      "responseReason",
      "latestAdmissionStatus",
      "latestAdmissionReason",
      "mutationCounts",
    ],
    driftPolicy: {
      httpStatus: "strict",
      responseReason: "strict",
      latestAdmissionStatus: "strict",
      latestAdmissionReason: "strict",
      mutationCounts: "strict",
    },
    supportFiles: [
      "test_daemon_governance_contract.ts",
    ],
  },
  {
    id: "gt08_structure_intent_visibility",
    scenario: "same-tick structure intent visibility",
    setup:
      "standalone deterministic capture of contended BUILD intents and same-tick OP_SENSE visibility under 1-worker vs 4-worker execution",
    duration: "1 tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "strictHashMatch",
      "senseVisibility",
      "conflictCellType",
      "conflictCellCharge",
      "snapshotDigest",
    ],
    driftPolicy: {
      strictHashMatch: "strict",
      senseVisibility: "strict",
      conflictCellType: "strict",
      conflictCellCharge: "bounded",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "test_structure_intent_determinism.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt09_collective_transport",
    scenario: "standalone collective hive and pheromone semantics",
    setup:
      "standalone deterministic capture of OP_COLLECTIVE mode 0/1 hive store-load and mode 2 pheromone emit through direct WASM execution",
    duration: "3 execute_atom calls / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "hiveValue",
      "loadedReg0",
      "pheromoneWord",
      "snapshotDigest",
    ],
    driftPolicy: {
      hiveValue: "strict",
      loadedReg0: "strict",
      pheromoneWord: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/collective_transport_capture.ts",
      "test_swarm.ts",
      "test_neural_synthesis.ts",
    ],
  },
  {
    id: "gt10_share_transfer",
    scenario: "standalone bonded share transfer semantics",
    setup:
      "standalone deterministic capture of OP_SHARE successful bonded transfer and empty-bond no-op through direct WASM execution",
    duration: "2 execute_atom calls / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "successfulSenderEnergy",
      "successfulReceiverEnergy",
      "failedSenderEnergy",
      "failedReceiverEnergy",
      "snapshotDigest",
    ],
    driftPolicy: {
      successfulSenderEnergy: "strict",
      successfulReceiverEnergy: "strict",
      failedSenderEnergy: "strict",
      failedReceiverEnergy: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/share_transfer_capture.ts",
      "test_metabolism.ts",
      "test_symbiosis.ts",
    ],
  },
  {
    id: "gt11_collective_banking",
    scenario: "standalone collective banking semantics",
    setup:
      "standalone deterministic capture of OP_COLLECTIVE mode 3 deposit and mode 4 capped withdraw through direct WASM execution",
    duration: "2 execute_atom calls / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "finalHiveBalance",
      "depositorEnergy",
      "withdrawerEnergy",
      "withdrawReg0",
      "snapshotDigest",
    ],
    driftPolicy: {
      finalHiveBalance: "strict",
      depositorEnergy: "strict",
      withdrawerEnergy: "strict",
      withdrawReg0: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/collective_banking_capture.ts",
      "test_metabolism.ts",
      "test_neural_synthesis.ts",
    ],
  },
  {
    id: "gt12_collective_synchrony",
    scenario: "standalone collective synchrony semantics",
    setup:
      "standalone deterministic capture of OP_COLLECTIVE mode 5 bonded phase-lock and mode 6 local quorum PC sync through direct WASM execution",
    duration: "2 standalone execute phases / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "phasePeer1Pc",
      "phasePeer2Pc",
      "quorumPeer1Pc",
      "quorumPeer2Pc",
      "quorumOutsiderPc",
      "snapshotDigest",
    ],
    driftPolicy: {
      phasePeer1Pc: "strict",
      phasePeer2Pc: "strict",
      quorumPeer1Pc: "strict",
      quorumPeer2Pc: "strict",
      quorumOutsiderPc: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/collective_synchrony_capture.ts",
      "test_swarm.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt13_structure_lock_progress",
    scenario: "standalone structure stale-lock progress",
    setup:
      "standalone deterministic subprocess capture of OP_SENSE visibility through a stale structure lock plus tick_structure_grid intent clearing",
    duration: "2 execute phases + 1 structure tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "visibleSenseReg",
      "typedMissSenseReg",
      "resolvedCellType",
      "resolvedCellCharge",
      "snapshotDigest",
    ],
    driftPolicy: {
      visibleSenseReg: "strict",
      typedMissSenseReg: "strict",
      resolvedCellType: "strict",
      resolvedCellCharge: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_lock_capture.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt14_structure_charge_resolution",
    scenario: "standalone structure charge resolution",
    setup:
      "standalone deterministic subprocess capture of OP_PLUG publishing a charge intent and tick_structure_grid resolving it into a concrete charged structure cell",
    duration: "1 execute phase + 1 structure tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "chargeIntentBeforeTick",
      "resolvedCellType",
      "resolvedCellCharge",
      "snapshotDigest",
    ],
    driftPolicy: {
      chargeIntentBeforeTick: "strict",
      resolvedCellType: "strict",
      resolvedCellCharge: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_charge_capture.ts",
      "test_structure_lock_progress.ts",
      "test_neural_synthesis.ts",
    ],
  },
  {
    id: "gt15_structure_charge_competition",
    scenario: "standalone structure charge competition",
    setup:
      "standalone deterministic subprocess capture of two OP_PLUG publications hitting the same cell in both low->high and high->low orderings",
    duration: "4 execute_atom calls + 1 structure tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "lowThenHighChargeIntent",
      "highThenLowChargeIntent",
      "lowThenHighResolvedCharge",
      "highThenLowResolvedCharge",
      "snapshotDigest",
    ],
    driftPolicy: {
      lowThenHighChargeIntent: "strict",
      highThenLowChargeIntent: "strict",
      lowThenHighResolvedCharge: "strict",
      highThenLowResolvedCharge: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_charge_competition_capture.ts",
      "verification/structure_charge_capture.ts",
      "test_structure_lock_progress.ts",
    ],
  },
  {
    id: "gt16_runtime_build_materialization",
    scenario: "runtime structure build materialization",
    setup:
      "worker-backed deterministic subprocess capture of a single architect executing OP_BUILD SOURCE through PULSE.tick",
    duration: "1 pulse tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "targetResolvedType",
      "targetResolvedCharge",
      "ownerIntentAfterTick",
      "valueIntentAfterTick",
      "snapshotDigest",
    ],
    driftPolicy: {
      targetResolvedType: "strict",
      targetResolvedCharge: "strict",
      ownerIntentAfterTick: "strict",
      valueIntentAfterTick: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_build_runtime_capture.ts",
      "test_neural_synthesis.ts",
      "test_structure_intent_determinism.ts",
    ],
  },
  {
    id: "gt17_runtime_build_competition",
    scenario: "runtime structure build competition",
    setup:
      "worker-backed deterministic subprocess capture of two architects publishing competing OP_BUILD SOURCE intents into the same cell through PULSE.tick",
    duration: "1 pulse tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "targetResolvedType",
      "targetResolvedCharge",
      "targetResolvedState",
      "ownerIntentAfterTick",
      "snapshotDigest",
    ],
    driftPolicy: {
      targetResolvedType: "strict",
      targetResolvedCharge: "strict",
      targetResolvedState: "strict",
      ownerIntentAfterTick: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_build_competition_capture.ts",
      "verification/structure_build_runtime_capture.ts",
      "test_structure_intent_determinism.ts",
    ],
  },
  {
    id: "gt18_runtime_build_stale_lock",
    scenario: "runtime structure build stale-lock fallback",
    setup:
      "worker-backed deterministic subprocess capture of a single architect attempting OP_BUILD SOURCE into a cell carrying a stale locked SOURCE intent through PULSE.tick",
    duration: "1 pulse tick / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "targetResolvedType",
      "targetResolvedCharge",
      "targetResolvedState",
      "ownerIntentAfterTick",
      "snapshotDigest",
    ],
    driftPolicy: {
      targetResolvedType: "strict",
      targetResolvedCharge: "strict",
      targetResolvedState: "strict",
      ownerIntentAfterTick: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/structure_build_lock_capture.ts",
      "verification/structure_build_runtime_capture.ts",
      "verification/structure_lock_capture.ts",
      "test_structure_intent_determinism.ts",
    ],
  },
  {
    id: "gt19_tensegrity_kinematics",
    scenario: "standalone tensegrity kinematics and bonding",
    setup:
      "standalone deterministic capture of OP_TENSEGRITY setting bond distances and damping, executing physics to resolve forces",
    duration: "100 physics ticks execution / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "finalDistance",
      "finalDamping",
      "snapshotDigest",
    ],
    driftPolicy: {
      finalDistance: "bounded",
      finalDamping: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/tensegrity_capture.ts",
      "test_tensegrity.ts",
    ],
  },
  {
    id: "gt20_bind_resolution",
    scenario: "standalone symbiotic bond resolution",
    setup:
      "standalone deterministic capture of OP_BIND writing a pending request into the shared buffer between two nearby atoms",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "initiatorId",
      "targetId",
      "requestStatus",
      "snapshotDigest",
    ],
    driftPolicy: {
      initiatorId: "strict",
      targetId: "strict",
      requestStatus: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/bind_resolution_capture.ts",
      "test_symbiosis.ts",
    ],
  },
  {
    id: "gt21_quorum_sync",
    scenario: "sovereignty protocol collective sync and aggressive share",
    setup:
      "standalone deterministic capture of OP_COLLECTIVE (quorum sync) and OP_SHARE (hormone-modulated aggression bonus)",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "quorumPcSync",
      "aggressiveShareAmount",
      "hormoneIndex2",
      "snapshotDigest",
    ],
    driftPolicy: {
      quorumPcSync: "strict",
      aggressiveShareAmount: "strict",
      hormoneIndex2: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/quorum_sync_capture.ts",
    ],
  },
  {
    id: "gt22_intent_resolution",
    scenario: "sovereignty protocol collective intent resolution (role/bank)",
    setup:
      "standalone deterministic capture of OP_RESOLVE for collective role shifts and energy banking via neighborhood quorum",
    duration: "1 execute phase / subprocess capture",
    daemonEnabled: false,
    metrics: [
      "roleResolution",
      "bankResolution",
      "quorumCount",
      "snapshotDigest",
    ],
    driftPolicy: {
      roleResolution: "strict",
      bankResolution: "strict",
      quorumCount: "strict",
      snapshotDigest: "strict",
    },
    supportFiles: [
      "verification/intent_resolution_capture.ts",
    ],
  },
];

export const GOLDEN_TRACE_CATALOG: readonly GoldenTraceScenario[] = Object
  .freeze(
    GOLDEN_TRACE_CATALOG_DATA.map((trace) =>
      Object.freeze({
        ...trace,
        metrics: Object.freeze([...trace.metrics]),
        driftPolicy: Object.freeze({ ...trace.driftPolicy }),
        supportFiles: Object.freeze([...trace.supportFiles]),
      })
    ),
  );

const TRACE_BY_ID = new Map<string, GoldenTraceScenario>(
  GOLDEN_TRACE_CATALOG.map((trace) => [trace.id, trace]),
);

export const goldenTraceById = (id: string): GoldenTraceScenario | null =>
  TRACE_BY_ID.get(id) ?? null;

export const goldenTraceArtifactPaths = (id: string) => {
  const trace = goldenTraceById(id);
  if (!trace) {
    throw new Error(`[golden_trace_catalog] unknown trace id: ${id}`);
  }
  const dir = `${TRACE_ROOT}/${trace.id}`;
  return {
    dir,
    traceJson: `${dir}/trace.json`,
    codexSnapshotJson: `${dir}/codex_snapshot.json`,
    invariantsJson: `${dir}/invariants.json`,
    notesMd: `${dir}/notes.md`,
  };
};
