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
    setup: "one accepted ingress case and one degraded/rejected case with daemon governance on",
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
    setup: "warmup 128 ticks, then one fixed INJECT_PLASMID payload with a blocked opcode",
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
];

export const GOLDEN_TRACE_CATALOG: readonly GoldenTraceScenario[] = Object.freeze(
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
