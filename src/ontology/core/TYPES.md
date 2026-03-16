---
id: TYPES
type: module
description: Centralized TypeScript types for the OMEGA-64 ontology.
tags:
  - core
  - substrate
min_level: 0
extra_symbols:
  - REJECTION
  - StateSnapshot
  - AutonomyState
  - DeltaProposal
  - GateConfig
  - AgentSignatureScheme
  - SignaturePolicy
  - AgentSignatureKey
  - GateDecision
  - LedgerEvent
  - BridgeModeEvent
  - ReplayInvariantReport
  - GateRuntimeContext
  - GeneticLedgerKey
  - LedgerMutability
  - GeneticLedgerEntry
  - SwarmHeartbeat
  - P2pFederationUpwardDelegate
  - NexusConfig
  - BehaviorFingerprint
  - BehaviorCluster
  - GlyphRoleCounters
  - GlyphSnapshot
  - InceptiveProgram
  - LegacyInstruction
  - GlyphTapeToken
  - RolePreamble
  - CodexLineageProfile
  - SovereignOracleAkashaDelegate
  - GateAcceptedProposalMetric
  - GateValidationResult
  - BridgeInvariantReportLike
  - GateBridgeResolution
  - OracleDrainStats
  - OraclePendingMutation
  - I16Limits
  - SpeciesEntry
  - ChronicleEntry
  - RelicEntry
  - InvariantSignal
  - InvariantEntry
  - DaemonAction
  - DaemonInjectEnvelope
  - DaemonNarrativeContext
  - DaemonInvariantAdmission
  - PlasmidRiskProfile
  - DaemonIngressPlan
  - DaemonIngressMetrics
  - WasmBootPolicy
  - KernelMode
  - ReplicationExecutionMode
  - DaemonInvariantFrame
  - SovereigntyEngineAkashaDelegate
  - InvariantPacket
  - InvariantPacketSigningKey
  - CodexNarrative
  - CodexState
  - GenomeStats
  - RelicCandidate
  - TaxonomyResult
---

### TypeScript

```typescript
/**
 * Canonical Rejection Reasons
 */
export const REJECTION = {
  SCHEMA_INVALID: "SCHEMA_INVALID",
  TICK_MISMATCH: "TICK_MISMATCH",
  BASE_HASH_MISMATCH: "BASE_HASH_MISMATCH",
  UNKNOWN_AGENT: "UNKNOWN_AGENT",
  COST_OVER_BUDGET: "COST_OVER_BUDGET",
  EMPTY_DELTA: "EMPTY_DELTA",
  OUT_OF_RANGE_VALUE: "OUT_OF_RANGE_VALUE",
  CANON_PATH_REQUIRES_GREEN_BRIDGE: "CANON_PATH_REQUIRES_GREEN_BRIDGE",
  SIGNATURE_REQUIRED: "SIGNATURE_REQUIRED",
  SIGNATURE_INVALID: "SIGNATURE_INVALID",
  SIGNATURE_KEY_MISSING: "SIGNATURE_KEY_MISSING",
  SIGNATURE_SCHEME_UNSUPPORTED: "SIGNATURE_SCHEME_UNSUPPORTED",
  PROPOSAL_ENVELOPE_HASH_MISMATCH: "PROPOSAL_ENVELOPE_HASH_MISMATCH",
  REPLAY_ENVELOPE_DUPLICATE: "REPLAY_ENVELOPE_DUPLICATE",
};

/**
 * StateSnapshot: The canonical state of the system at a specific tick.
 */
export interface StateSnapshot {
  tick: number;
  state_i16: Int16Array;
  state_hash: string;
  phase_u16?: Uint16Array;
  stability_q15?: Float32Array;
  entropy_i16?: Int16Array;
}

/**
 * AutonomyState: Represents the sovereignty levels of the system.
 */
export interface AutonomyState {
  state: number;
  gov: number;
  code: number;
}

/**
 * DeltaProposal: A request from an agent to modify the state.
 */
export interface DeltaProposal {
  proposal_id: string;
  tick: number;
  base_state_hash: string;
  agent_id: string;
  agent_phase_u16?: number;
  intent?: string;
  confidence: number;
  delta: Array<{ level: number; value: number }>;
  cost_estimate?: number;
  artifact_hash?: string;
  semantic_fingerprint?: string;
  causal_refs?: string[];
  target_path?: "LOCAL" | "CANON";
  quorum_strength?: number;
  origin_atom_idx?: number;
  resonance?: number;
  signature_scheme?: AgentSignatureScheme;
  agent_signature?: string;
  proposal_envelope_hash?: string;
}

export type AgentSignatureScheme = "ed25519/v1" | "hmac-sha256/v1";
export type SignaturePolicy = "DISABLED" | "OPTIONAL" | "REQUIRED";
export type AgentSignatureKey =
  | { scheme: "ed25519/v1"; public_key_b64: string }
  | { scheme: "hmac-sha256/v1"; secret: string };

/**
 * GateConfig: Configuration for the L32 Gate.
 */
export interface GateConfig {
  max_abs_delta_per_level: number;
  max_total_abs_delta_per_tick: number;
  max_total_cost_per_tick?: number;
  max_cost_per_agent: number;
  reliability_weight: Map<string, number>;
  reliability_mode?: "STATIC" | "PHASE_COHERENCE";
  reliability_floor?: number;
  dry_run: boolean;
  global_syntropy?: number;
  signature_policy?: SignaturePolicy;
  agent_signature_keys?: Map<string, AgentSignatureKey>;
  anti_replay_window_ticks?: number;
}

/**
 * GateDecision: The result of the L32 Gate processing.
 */
export interface GateDecision {
  accepted_proposals: string[];
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  budget_used: number;
  cost_used: number;
  accepted_delta: Array<{ level: number; value: number }>;
}

/**
 * LedgerEvent: The canonical record of a state transition.
 */
export interface LedgerEvent {
  event_id: string;
  tick: number;
  ts_unix_ms: number;
  state_before_hash: string;
  state_after_hash: string;
  accepted_delta: Array<{ level: number; value: number }>;
  proposal_digest: string;
  accepted_proposals: string[];
  accepted_proposal_metrics?: Array<{
    proposal_id: string;
    agent_id: string;
    confidence: number;
    reliability_base: number;
    reliability_effective: number;
    phase_coherence?: number;
    weight: number;
    physical_cost: number;
    agent_phase_u16?: number;
  }>;
  accepted_proposal_envelopes?: Array<
    { proposal_id: string; envelope_hash: string }
  >;
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  cost_total: number;
  cost_limit?: number;
  budget_used: number;
  budget_limit?: number;
  gate_config_version: string;
  signature_artifact_hash?: string;
  signature_tick?: number;
  signature_causal_refs?: string[];
  projection_2d_hash?: string;
  thread_1d_hash?: string;
  projection_version?: string;
  policy_version?: string;
  policy_hash?: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

/**
 * BridgeModeEvent: L32 membrane trace for canon causal integrity mode.
 */
export interface BridgeModeEvent {
  event_type: "BRIDGE_MODE_EVENT";
  tick: number;
  state_hash: string;
  mode: "GREEN" | "AMBER" | "RED";
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked?: boolean;
  gate_admission_index_chain_ok?: boolean;
  gate_admission_index_chain_checked_records?: number;
  gate_admission_index_chain_failures?: string[];
  invariant_packet_hash?: string;
  canon_bound_proposals: string[];
  blocked_canon_proposals: string[];
  reason: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

export interface ReplayInvariantReport {
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked: boolean;
  gate_admission_index_chain_ok: boolean;
  gate_admission_index_chain_checked_records: number;
  gate_admission_index_chain_failures: string[];
}

export interface GateRuntimeContext {
  bridge_invariant_report?: ReplayInvariantReport;
  witness?: string;
}

export type GeneticLedgerKey =
  | "pulse.homeostasis.targetEnergy"
  | "pulse.homeostasis.band"
  | "pulse.homeostasis.maxDelta"
  | "pulse.homeostasis.overflowThreshold"
  | "pulse.homeostasis.baseTax"
  | "pulse.pressureRing.scale"
  | "daemon.maxActionsPerWindow"
  | "daemon.maxPheromoneIntensity"
  | "daemon.maxPlasmidCharge"
  | "federation.admission.degradeEnergyRatio"
  | "federation.admission.degradeResonanceRatio";

export type LedgerMutability =
  | "hard-invariant"
  | "bounded-runtime"
  | "daemon-governed";

export type GeneticLedgerEntry = {
  key: GeneticLedgerKey;
  defaultValue: number;
  min: number;
  max: number;
  mutability: LedgerMutability;
  hormoneLink: string | null;
  rollbackClass: "immediate" | "epochal";
  sourcePath: string;
  notes: string;
};

export type SwarmHeartbeat = {
  nodeId: string;
  currentTick: number;
  epochHash: string;
  phase: number;
};

export interface P2pFederationUpwardDelegate {
  recordTelemetry(event: { lane: string; kind: string; count: number }): void;
  lookupLineageProfile(lineage: string): any;
  captureBehaviorFrame(idx: number): any;
}

export type NexusConfig = {
  instanceId: number;
  seedNodes: string[];
  mainnetEnabled?: boolean;
  bootstrapHubUrl?: string;
};

export type BehaviorFingerprint = {
  replicateRatio: number;
  signalRatio: number;
  buildRatio: number;
  survivalCurve: number[];
};

export type BehaviorCluster = {
  behaviorSignature: string;
  memberCount: number;
  dominantRole: number;
  genomeSamples: string[];
  fingerprint: BehaviorFingerprint;
};

export type GlyphRoleCounters = {
  neutral: number;
  producer: number;
  guardian: number;
  architect: number;
  parasite: number;
};

export type GlyphSnapshot = {
  activeCells: number;
  pheromoneCells: number;
  plasmidCells: number;
  maxAmplitude: number;
  totalAmplitude: number;
  roleCounters: GlyphRoleCounters;
  avgEnergy: number;
  avgResonance: number;
  dominantRole: number;
  tick: number;
};

export interface InceptiveProgram {
  bytecode: number[];
  metadata?: {
    ancestorHash?: bigint;
    roleHint?: number;
  };
}

export type LegacyInstruction = {
  pc: number;
  opcode: number;
  opcodeMnemonic: string;
  length: number;
  args: number[];
};

export type GlyphTapeToken = LegacyInstruction & {
  glyphId: number | null;
  glyphMnemonic: string | null;
  mapped: boolean;
};

export type RolePreamble = {
  roleId: number;
  bytecode: number[];
};

export type CodexLineageProfile = {
  genome: string;
  label: string;
  dominantEpochs: number;
  peakShare: number;
  known: boolean;
};

export interface SovereignOracleAkashaDelegate {
  recordTelemetry(event: { lane: string; kind: string; count: number }): void;
  appendObserverCommentary(tick: number, epoch: number, message: string): Promise<void>;
}

export type GateAcceptedProposalMetric = {
  proposal_id: string;
  agent_id: string;
  confidence: number;
  reliability_base: number;
  reliability_effective: number;
  phase_coherence?: number;
  weight: number;
  physical_cost: number;
  agent_phase_u16?: number;
};

export type GateValidationResult = {
  validProposals: DeltaProposal[];
  proposalDigest: string;
  envelopeHashByProposal: Map<string, string>;
  canonBoundProposals: string[];
  blockedCanonProposals: string[];
};

export type BridgeInvariantReportLike = {
  index_chain_checked?: boolean;
  index_chain_ok?: boolean;
  index_chain_failures?: string[];
  gate_admission_index_chain_checked?: boolean;
  gate_admission_index_chain_ok?: boolean;
  gate_admission_index_chain_failures?: string[];
};

export type GateBridgeResolution = {
  mode: "GREEN" | "AMBER" | "RED";
  reason: string;
};

export type OracleDrainStats = {
  applied: number;
  skipped: number;
  dropped: number;
  remaining: number;
};

export type OraclePendingMutation =
  | {
    kind: "oracle_head_mutation";
    regentIndex: number;
    headBytes: Uint8Array;
    genomeHex: string;
  }
  | {
    kind: "oracle_memetic_injection";
    regentIndex: number;
    memeBytes: Uint8Array;
  }
  | {
    kind: "oracle_cache_fallback";
    regentIndex: number;
    logicBytes: Uint8Array;
    cachedHex: string;
  }
  | {
    kind: "oracle_whisper_broadcast";
    gridIdx: number;
    charge: number;
    memeBytes: Uint8Array;
  }
  | {
    kind: "oracle_plasmid_injection";
    gridIdx: number;
    charge: number;
    plasmidBytes: Uint8Array;
    source: "oracle_guidance" | "oracle_cache_fallback";
  };

export type I16Limits = {
  max: number;
  span: number;
};

export type SpeciesEntry = {
  id: string;
  genome: string;
  latinName: string;
  behavior: string;
  philosophy: string;
  dominantInstructions: string[];
  firstRecordedTick: number;
  lastDominantTick: number;
  dominantEpochs: number;
  peakShare: number;
  filePath: string;
  createdAt: string;
};

export type ChronicleEntry = {
  id: string;
  tick: number;
  epoch: number;
  type: string;
  title: string;
  body: string;
  createdAt: string;
};

export type RelicEntry = {
  id: string;
  tick: number;
  epoch: number;
  signature: string;
  size: number;
  bounds: { x0: number; y0: number; x1: number; y1: number };
  summary: string;
  snapshotPath: string;
  filePath: string;
  createdAt: string;
};

export type InvariantSignal = {
  key: string;
  vector: string;
  weight: number;
  evidence: string[];
};

export type InvariantEntry = {
  id: string;
  tick: number;
  epoch: number;
  center: string;
  signature: string;
  summary: string;
  dominantVector: string;
  signals: InvariantSignal[];
  source: string;
  filePath: string;
  createdAt: string;
  hormones: number[];
};

export type DaemonInvariantFrame = {
  tick: number;
  epoch: number;
  center: string;
  signature: string;
  summary: string;
  invariants: InvariantSignal[];
  created_at: string;
  hormones: number[];
};

export type CodexNarrative = {
  tick: number;
  epoch: number;
  mood: "ASCENDANT" | "STABLE" | "FRAGILE";
  title: string;
  summary: string;
  sharedCenter: string;
  speciesHighlights: Array<{
    latinName: string;
    genome: string;
    dominantEpochs: number;
    peakShare: number;
  }>;
  invariantHighlights: Array<{
    tick: number;
    epoch: number;
    center: string;
    signature: string;
    dominantVector: string;
    summary: string;
  }>;
  recentChronicles: Array<{
    tick: number;
    epoch: number;
    type: string;
    title: string;
  }>;
  relicStatus: string;
  glyphStatus: string;
  glyphRegime: string;
  glyphDominantRole: string;
  glyphSourceMode: string;
  metabolicPressure: number;
  daemonEffectStatus: string;
  daemonEffectLineage: string;
  daemonEffectDeltaBand: string;
  hormoneRegime: string;
  promptBridge: string;
  hippocampusRecall?: {
    tick: number;
    epoch: number;
    summary: string;
    distance: number;
    distanceType: string;
  };
};

export type CodexState = {
  version: number;
  epochTicks: number;
  lastEpochScanTick: number;
  populationPeak: number;
  lastPopulation: number;
  lastMassExtinctionTick: number;
  lastDecree: string;
  lastDecreeTick: number;
  genomeEpochs: Record<string, number[]>;
  relicSignatures: string[];
  invariantSignatures: string[];
  lastGlyphTransportSignature: string;
  lastGlyphTransportTick: number;
  lastGlyphTransportRegime: string;
  lastGlyphTransportSummary: string;
  lastGlyphTransportDominantRole: string;
  lastGlyphTransportSourceMode: string;
  lastHormoneRegimeSignature: string;
  lastHormoneRegimeTick: number;
  lastHormoneRegimeSummary: string;
  lastDaemonEffectTick: number;
  lastDaemonEffectSummary: string;
  lastDaemonEffectLineage: string;
  lastDaemonEffectDeltaBand: string;
  lastSyntropy: number;
  lastImmunePurgeTick: number;
  lastImmunePurgeCount: number;
};

export type GenomeStats = {
  genome: string;
  count: number;
  share: number;
  sampleIndices: number[];
};

export type RelicCandidate = {
  cells: number[];
  bounds: { x0: number; y0: number; x1: number; y1: number };
  size: number;
  signatureBase: string;
};

export type TaxonomyResult = {
  latinName: string;
  behavior: string;
  philosophy: string;
};

export type WasmBootPolicy = "fail-fast" | "safe-noop";
export type KernelMode = "as" | "rust";
export type ReplicationExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type DaemonAction = "DROP_PHEROMONE" | "INJECT_PLASMID" | "OBSERVE";

export type DaemonInjectEnvelope = {
  action_type: DaemonAction;
  payload: {
    target_x: number;
    target_y: number;
    intensity: number;
    hex_code?: string;
  };
};

export type DaemonNarrativeContext = {
  mood: string;
  sharedCenter: string;
  dominantInvariantVector: string;
  codexLineageLabel: string;
  codexLineageGuardScore: number;
  codexLineageGuardReasons: string[];
  glyphStatus: string;
  glyphRegime: string;
  glyphDominantRole: string;
  glyphSourceMode: string;
  metabolicPressure: number;
  hormoneRegime: string;
};

export type DaemonInvariantAdmission = {
  score: number;
  severity: "LOW" | "MID" | "HIGH";
  reasons: string[];
  context: DaemonNarrativeContext;
};

export type PlasmidRiskProfile = {
  level: "LOW" | "MID" | "HIGH";
  score: number;
  reasons: string[];
  opcode: number;
};

export type DaemonIngressPlan = {
  requested: DaemonInjectEnvelope;
  applied: DaemonInjectEnvelope;
  degraded: boolean;
  degradeReason: string | null;
  admission: DaemonInvariantAdmission;
};

export type DaemonIngressMetrics = {
  population: number;
  avgEnergy: number;
};

export interface SovereigntyEngineAkashaDelegate {
  recordDecreeShift(
    tick: number,
    oldDecree: string,
    newDecree: string,
    newEpochCount: number,
  ): void;
}

export interface InvariantPacket {
  version: string;
  tick_anchor: number;
  canon_index_chain_checked: boolean;
  canon_index_chain_ok: boolean;
  gate_admission_index_chain_checked: boolean;
  gate_admission_index_chain_ok: boolean;
  ledger_chain_checked?: boolean;
  ledger_chain_ok?: boolean;
  witness?: string;
  packet_hash?: string;
  signature_scheme?: "hmac-sha256/v1";
  packet_signature?: string;
}

export type InvariantPacketSigningKey = {
  scheme: "hmac-sha256/v1";
  secret: string;
};
```
