// SSoT: file:///Users/s0fractal/OMEGA/I/core/TYPES.md

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

export interface ProjectionOptions {
  resolution?: number;
  deterministic?: boolean;
  noiseAmplitude?: number;
  noiseAlpha?: number;
}

export interface ThreadProjectionConfig {
  radial_bins: number;
  angular_bins: number;
}

export interface TopologicalSignature {
  artifact_hash: string;
  state_hash: string;
  tick: number;
  causal_refs: string[];
  projection_2d_hash: string;
  thread_1d_hash: string;
  projection_version: string;
  witness?: string;
}

export interface TopologicalSignatureInput {
  artifact_hash: string;
  state_hash: string;
  tick: number;
  state: unknown;
  causal_refs?: string[];
  witness?: string;
}

export type Ed25519SigningKey = {
  scheme: "ed25519/v1";
  private_key_pkcs8_b64: string;
};

export type Ed25519VerifyKey = { scheme: "ed25519/v1"; public_key_b64: string };

export type HmacKey = { scheme: "hmac-sha256/v1"; secret: string };

export type PhysiologySnapshotInput = {
  tick: number;
  hormones: Record<HormoneId, LedgerRuntimeSnapshot<HormoneId>>;
  ledger: Partial<
    Record<GeneticLedgerKey, LedgerRuntimeSnapshot<GeneticLedgerKey>>
  >;
};

export type HormoneSnapshot = HormoneSpec & {
  currentValue: number;
  deltaFromDefault: number;
}

export type LedgerSnapshot = GeneticLedgerEntry & {
  currentValue: number;
  deltaFromDefault: number;
  currentSource: "runtime" | "policy";
}

export interface PredictionMarketAkashaDelegate {
  recordMarketResolution(
    tick: number,
    consensusReached: boolean,
    finalThreshold: number,
    winnersHash: string,
  ): void;
}

export type ExportManifest = {
  era: string;
  runtime_root_files?: string[];
  runtime_support_files?: string[];
  experimental_files?: string[];
  core_entry_files: string[];
  required_additional_files: string[];
  context_files: string[];
}

export type LoadedManifest = {
  era: string;
  runtimeRootFiles: string[];
  runtimeSupportFiles: string[];
  experimentalFiles: string[];
  coreEntryFiles: string[];
  requiredArchFiles: string[];
  contextFiles: string[];
}

export type ExportProvenance = {
  manifestSha256: string;
  exportSetSha256: string;
  exportContentSha256: string;
  gitCommit: string;
}

export type ExportFileContent = {
  file: string;
  content: string;
}

export type HormoneId =
  | "entropy_pressure"
  | "time_viscosity"
  | "aggression"
  | "replication_bias"
  | "repair_drive"
  | "mutation_friction"
  | "global_consensus";

export type HormoneDomain =
  | "systemic"
  | "temporal"
  | "conflict"
  | "reproduction"
  | "repair"
  | "mutation";

export type HormoneSpec = {
  id: HormoneId;
  index: number;
  domain: HormoneDomain;
  min: number;
  max: number;
  defaultValue: number;
  controlPlane: "daemon" | "pulse" | "mixed";
  sourcePath: string;
  notes: string;
};

export type ContinuumMetadata = {
  epochName: string;
  tick: number;
  memoryBounds: number;
  population?: number;
  coherence?: number;
  epochHash?: string;
  timestamp: string;
}

export interface ControlIntentQueueDelegate {
  recordTelemetry(event: { lane: string; kind: string; count: number }): void;
  importSnapshot(timestamp: string): Promise<{ success?: boolean }>;
  unpackAtom(packet: Uint8Array): number;
}

export type CrisisIntent = {
  kind: "crisis";
  logicBytes: Uint8Array;
}

export type FederateIntent = {
  kind: "federate";
  packet: Uint8Array;
  sourceNode: string;
}

export type FederationAdmissionSeverity = "LOW" | "MID" | "HIGH";

export type FederationAdmissionAction =
  | "accept"
  | "degrade"
  | "hybridize"
  | "reject";

export type FederationRuleGenomeProfile = {
  signature: string;
  noveltySigned: number;
  symbiosisSigned: number;
  pressureRingScale: number;
  workerCount: number;
  strictDeterminism: boolean;
  generatedAt: string;
}

export type FederationBehaviorProfile = {
  invariant: string;
  dominantRole: number;
  memberCount: number;
  generatedAt: string;
}

export type FederationLocalBehaviorContext = {
  invariant: string;
  dominantRole: number;
  memberCount: number;
}

export type FederationCodexProfile = {
  genome: string;
  label: string;
  dominantEpochs: number;
  peakShare: number;
  known: boolean;
  generatedAt: string;
}

export type FederationLocalCodexContext = {
  genome: string;
  label: string;
  dominantEpochs: number;
  peakShare: number;
  known: boolean;
}

export type FederationPolicyFragmentSource =
  | "rule_genome"
  | "behavior"
  | "codex";

export type FederationPolicyFragmentMode = "tax" | "subsidy";

export type FederationAdmissionSnapshot = {
  tick: number;
  atomId: string;
  sourceNode: string;
  action: FederationAdmissionAction;
  severity: FederationAdmissionSeverity;
  score: number;
  reasons: string[];
  localSignature: string;
  peerSignature: string;
  strictMismatch: boolean;
  degraded: boolean;
  hybridized: boolean;
  localBehaviorInvariant: string;
  peerBehaviorInvariant: string;
  behaviorDistance: number;
  localCodexLabel: string;
  peerCodexLabel: string;
  codexDistance: number;
  policyFragments: FederationPolicyFragment[];
  policyEnergyRatio: number;
  policyResonanceRatio: number;
}

export type FederateAdmissionResult = {
  action: FederationAdmissionAction;
  packet: {
    logicBytes: Uint8Array;
    energy: number;
    resonance: number;
  };
  admission: FederationAdmissionSnapshot;
}

export type MutateIntent = {
  kind: "mutate";
  x: number;
  y: number;
  deltaEnergy: number;
  radius: number;
}

export type AvatarIntent = {
  kind: "avatar";
  x: number;
  y: number;
  intensity: number;
  source: "external_ingress" | "external_daemon";
}

export type PlasmidIntent = {
  kind: "plasmid";
  x: number;
  y: number;
  charge: number;
  plasmidBytes: Uint8Array;
  source: "external_ingress" | "external_daemon";
}

export type SnapshotImportIntent = {
  kind: "snapshot_import";
  timestamp: string;
}

export type QueueDecision = {
  ok: boolean;
  status: number;
  reason: string;
  size: number;
  max: number;
  admission?: FederationAdmissionSnapshot;
}

export type ApplyStats = {
  drained: number;
  applied: number;
  failed: number;
  remaining: number;
}

export type HormoneSyncInput = {
  baseTax: number;
  targetEnergy: number;
  workerCount: number;
  egoPressure: number;
  fearPressure: number;
  noveltyPressure: number;
  symbiosisPressure: number;
  maxPlasmidCharge: number;
  pressureRingScale: number;
  // Generic Ledger inputs (Stage 7.2)
  homeostasisBand: number;
  homeostasisMaxDelta: number;
  homeostasisOverflowThreshold: number;
  daemonMaxActions: number;
  federationDegradeEnergyRatio: number;
  globalSyntropy: number;
}

export type SnapshotExportOptions = {
  tick?: number;
  reason?: string;
  prune?: boolean;
  retention?: number;
}

export type GateMergedDelta = Array<{ level: number; value: number }>;

export type Telemetry = {
  tick: number;
  avgEnergy: number;
  dominantGenomes: string[];
  voxPopuli: string[];
  behavior_invariant?: string;
  behavior_clusters?: Array<{
    behaviorSignature: string;
    memberCount: number;
    dominantRole: number;
    genomeSamples: string[];
    fingerprint?: {
      replicateRatio: number;
      signalRatio: number;
      buildRatio: number;
      survivalCurve: number[];
    };
    lastTick?: number;
  }>;
  federation_rule_genome?: any;
  federation_admission?: any;
  pulse_pressure?: {
    novelty_signed: number;
    symbiosis_signed: number;
    novelty: number;
    fear: number;
    symbiosis: number;
    ego: number;
    ring: {
      enabled: boolean;
      theta: number;
      scale: number;
      fear_curiosity_balance: number;
      ego_love_balance: number;
      novelty_axis_from_ring: boolean;
      symbiosis_axis_from_ring: boolean;
    };
  };
  daemon_governance?: {
    safe_mode: boolean;
    safe_mode_reason: string;
    actions_used_in_window: number;
    actions_max_in_window: number;
    window_reset_in_ms: number;
    max_pheromone_intensity: number;
    max_plasmid_charge: number;
    invariant_drift_mid_score: number;
    invariant_drift_high_score: number;
    last_admission?: unknown;
    last_admission_history?: unknown[];
    last_pressure_ring_update?: unknown;
    last_pressure_ring_history?: unknown[];
    last_homeostasis_update?: unknown;
    last_homeostasis_history?: unknown[];
    homeostasis?: {
      enabled: boolean;
      target_energy: number;
      target_energy_default?: number;
      target_energy_current?: number;
      band: number;
      max_delta: number;
      overflow_threshold: number;
      starvation_floor: number;
      subsidy_enabled: boolean;
      base_tax_default: number;
      base_tax_current: number;
      last_update_tick: number;
      last_update_source: string;
      last_update_reason: string;
    };
  };
  spatial_hash_guard?: {
    overflow_ratio: number;
    overflow_count: number;
    max_cell_count: number;
  };
  hormones?: number[];
}

export type ActionType = "DROP_PHEROMONE" | "INJECT_PLASMID" | "OBSERVE";

export type DaemonDecision = {
  internal_monologue: string;
  action_type: ActionType;
  payload: {
    target_x: number;
    target_y: number;
    hex_code?: string;
    intensity: number;
  };
}

export type InvariantFrame = {
  tick: number;
  epoch: number;
  center: string;
  signature: string;
  invariants: InvariantSignal[];
  summary: string;
  created_at: string;
  hormones: number[];
}

export type OpenAIChoice = {
  message?: {
    content?: string;
  };
}

export type OpenAIResponse = {
  choices?: OpenAIChoice[];
}

export type LedgerRecord<K extends GeneticLedgerKey> =
  | {
    kind: "apply";
    key: K;
    rollback_token: string;
    tick: number;
    source: string;
    reason: string;
    previous_value: number;
    next_value: number;
    recorded_at: string;
  }

export type LedgerSnapshotRecord<K extends GeneticLedgerKey> = {
  version: 1;
  key: K;
  representedRecordCount: number;
  representedApplyCount: number;
  representedRollbackCount: number;
  compactedAt: string;
  compactedTick: number;
  state: LedgerRuntimeState<K>;
}

export type LedgerPersistenceSummary = {
  path: string;
  snapshotPath: string;
  exists: boolean;
  snapshotExists: boolean;
  recordCount: number;
  applyCount: number;
  rollbackCount: number;
  tailRecordCount: number;
  tailApplyCount: number;
  tailRollbackCount: number;
  snapshotRecordCount: number;
  snapshotApplyCount: number;
  snapshotRollbackCount: number;
  compactionEnabled: boolean;
  compactionThreshold: number;
  compactionKeepTail: number;
  lastCompactedAt: string | null;
  lastCompactedTick: number;
  hydrated: boolean;
  lastHydratedAt: string | null;
  lastHydrationError: string | null;
}

export type LedgerHydrationResult<K extends GeneticLedgerKey> = {
  state: LedgerRuntimeState<K>;
  snapshot: LedgerRuntimeSnapshot<K>;
  persistence: LedgerPersistenceSummary;
}

export type DriftMetrics = {
  coherence: number;
  energyVariance: number;
  populationStability: number;
  driftIndex: number;
  shadowForkRecommended: boolean;
}

export interface PulseOracleDelegate {
  setNeuralCoherence(coherence: number): void;
  getNeuralCoherence(): number;
  gatherEpochTelemetry(): any;
  broadcastWhisper(tick: number, telemetry: any, coherence: number): void;
  consultOracle(regentIdx: number, telemetry: any): void;
  drainPendingMutations(): void;
}

export interface PulseAkashaDelegate {
  recordMutationTelemetry(
    event: { lane: string; kind: string; count: number },
  ): void;
  flushMutationTelemetry(tick: number): void;
  compressMemory(wasmMemory: WebAssembly.Memory): Promise<Uint8Array>;
  decompressMemoryToLattice(
    wasmMemory: WebAssembly.Memory,
    payload: Uint8Array,
  ): Promise<void>;
  saveEpoch(
    memory: WebAssembly.Memory,
    tick: number,
    label: string,
    count1: number,
    count2: number,
    hash: string,
  ): Promise<void>;
  broadcastPanopticonFrame(frame: ArrayBuffer): void;
  recordImmunologicalPurge(count: number): Promise<void>;
  observePulseCodex(tick: number, pop: number, glyphs: any, syn: number): void;
  saveSnap(tick: number): Promise<void>;
  cleanupSnap(retention: number): void;
}

export interface PulseNoosphereDelegate {
  unpackAtom(payload: Uint8Array): number;
  packAtom(idx: number): Uint8Array;
  evaluateHeartbeat(
    tick: number,
    epochHash: string,
    avgPhase: number,
    egressCount: number,
  ): void;
  sendEpochPayload(peerId: string, payload: Uint8Array): void;
  routeAtom(payload: Uint8Array): void;
  startNexus(): void;
  broadcastSyncRequest(): void;
  broadcastEpochConsensus(tick: number, hashSum: bigint): void;
  getNexusStatus(): {
    mainnetEnabled: boolean;
    bootstrapHubUrl: string;
    seedNodesLength: number;
    localCurrentTick: number;
    localTps: number;
  };
  setNexusStatus(status: {
    mainnetEnabled?: boolean;
    bootstrapHubUrl?: string;
    localCurrentTick?: number;
    localTps?: number;
  }): void;
  getMedianSwarmTick(tick: number): number;
}

export type EvolutionPressureState = {
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

export type SpatialHashState = {
  tick: number;
  overflowCount: number;
  maxCellCount: number;
  overflowRatio: number;
};

export type HomeostasisState = {
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

export type GeneticLedgerRuntimeState = {
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
  federationDegradeResonanceRatio: LedgerRuntimeSnapshot<
    "federation.admission.degradeResonanceRatio"
  >;
  federationDegradeResonanceRatioPersistence: LedgerPersistenceSummary;
};

export type GuardianSignalHybridState = {
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
}

export type ArchitectPlasmidHybridState = {
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
}

export type RollingHistory = {
  add: (val: number) => void;
  sum: () => number;
  size: () => number;
}

export interface AuditEngineExocortexDelegate {
  generateThought(context: string): Promise<string>;
}

export type LedgerRuntimeEvent<K extends string> = {
  rollbackToken: string;
  previousValue: number;
  nextValue: number;
  tick: number;
  source: string;
  reason: string;
  rolledBackAtTick: number | null;
  rolledBackSource: string | null;
  rolledBackReason: string | null;
}

export type LedgerRuntimeState<K extends string> = {
  key: K;
  currentValue: number;
  defaultValue: number;
  min: number;
  max: number;
  rollbackClass: "immediate" | "epochal";
  seq: number;
  historyLimit: number;
  history: readonly LedgerRuntimeEvent<K>[];
  lastAppliedTick: number;
  lastAppliedSource: string;
  lastAppliedReason: string;
  lastAppliedRollbackToken: string | null;
  lastRollbackTick: number;
  lastRollbackSource: string;
  lastRollbackReason: string;
  lastRollbackToken: string | null;
}

export type LedgerRuntimeSnapshot<K extends string> = {
  key: K;
  currentValue: number;
  defaultValue: number;
  min: number;
  max: number;
  rollbackClass: "immediate" | "epochal";
  historyDepth: number;
  lastAppliedTick: number;
  lastAppliedSource: string;
  lastAppliedReason: string;
  lastAppliedRollbackToken: string | null;
  lastRollbackTick: number;
  lastRollbackSource: string;
  lastRollbackReason: string;
  lastRollbackToken: string | null;
}

export type LedgerApplyResult<K extends string> = {
  status: "applied" | "noop";
  changed: boolean;
  previousValue: number;
  nextValue: number;
  mutation: LedgerRuntimeEvent<K> | null;
  state: LedgerRuntimeState<K>;
}

export type LedgerRollbackResult<K extends string> = {
  status: "rolled_back" | "missing" | "consumed" | "stale";
  changed: boolean;
  previousValue: number;
  nextValue: number;
  mutation: LedgerRuntimeEvent<K> | null;
  state: LedgerRuntimeState<K>;
}

export type LedgerRuntimeConfig<K extends string> = {
  key: K;
  defaultValue: number;
  min: number;
  max: number;
  rollbackClass: "immediate" | "epochal";
}

export type GuardianSignalExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type GlyphKind =
  | "core"
  | "control"
  | "transport"
  | "structural"
  | "catalytic"
  | "regulatory"
  | "memory"
  | "reserve";

export type GlyphStabilityClass =
  | "hard-invariant"
  | "legacy-bridge"
  | "bounded-dynamic"
  | "reserve";

export type GlyphSpec = {
  id: number;
  mnemonic: string;
  kind: GlyphKind;
  arity: number;
  energyCost: number;
  stabilityClass: GlyphStabilityClass;
  reductionRuleRef: string;
  legacyOpcode?: number;
  notes?: string;
  vertexIndex?: number;
  rgb?: [number, number, number];
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export type AssembleToken = number | string;

export type HarnessProps = Record<number, number>;

export type ShadowEffects = {
  replicateCount: number;
  signalCount: number;
  buildCount: number;
  bondRequestCount: number;
  sporeDriveCount: number;
  entangleCount: number;
  roleWrites: number[];
  branchTaken: boolean;
  jumpCount: number;
}

export type ShadowState = {
  atomIndex: number;
  pc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;

  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  cellPeers: number[];
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  executed: string[];
  energySpent: number;
}

export type LegacyShadowResult = {
  mode: "legacy";
  finalPc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;

  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  energySpent: number;
  executed: string[];
  stepsExecuted: number;
}

export type ReductionShadowResult = {
  mode: "glyph-reduction";
  finalPc: number;
  regs: number[];
  role: number;
  props: HarnessProps;
  bondTargets: HarnessProps;
  bondDistances: HarnessProps;
  damping: number;
  peerEnergy: HarnessProps;
  peerPc: HarnessProps;
  hiveMemory: HarnessProps;
  hiveBalance: number;
  signalGrid: HarnessProps;
  structureGrid: HarnessProps;
  structureIntentOwner: HarnessProps;
  structureIntentValue: HarnessProps;
  structureChargeIntent: HarnessProps;
  bondRequests: HarnessProps;
  hiveEnergyPool: HarnessProps;
  hormones: number[];
  effects: ShadowEffects;
  energySpent: number;
  executed: string[];
  stepsExecuted: number;
  glyphTape: GlyphTapeToken[];
  prettyTape: string;
}

export type ReductionBaselineAnchor = {
  traceId: string;
  scenario: string;
  runtimeMode: string;
  tickStart: number;
  tickEnd: number;
  codexSnapshotDigest: string;
  invariantDigest: string;
}

export type ReductionHarnessResult = {
  caseId: string;
  baseline: ReductionBaselineAnchor;
  legacy: LegacyShadowResult;
  reduction: ReductionShadowResult;
  parity: {
    ok: boolean;
    reasons: string[];
  };
}

export type ReductionHarnessArtifact = {
  case_id: string;
  baseline_trace_id: string;
  baseline_runtime_mode: string;
  parity_ok: boolean;
  parity_reasons: string[];
  legacy_digest: string;
  reduction_digest: string;
  executed_digest_legacy: string;
  executed_digest_reduction: string;
  diff: {
    final_pc_match: boolean;
    registers_match: boolean;

    role_match: boolean;
    props_match: boolean;
    bond_targets_match: boolean;
    bond_distances_match: boolean;
    damping_match: boolean;
    peer_energy_match: boolean;
    peer_pc_match: boolean;
    hive_memory_match: boolean;
    hive_balance_match: boolean;
    signal_grid_match: boolean;
    structure_grid_match: boolean;
    structure_intent_owner_match: boolean;
    structure_intent_value_match: boolean;
    structure_charge_intent_match: boolean;
    bond_requests_match: boolean;
    hive_energy_pool_match: boolean;
    replicate_count_match: boolean;
    signal_count_match: boolean;
    build_count_match: boolean;
    branch_taken_match: boolean;
    role_writes_match: boolean;
    energy_spent_delta: number;
  };
  expectation_summary: ReductionCaseDefinition["expected"];
}

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
}

export type ReductionCaseExpectation = {
  finalPc: number;
  replicateCount?: number;
  signalCount?: number;
  buildCount?: number;
  finalRole?: number;
  registers?: number[];
  finalProps?: Partial<Record<number, number>>;
  finalHiveMemory?: Partial<Record<number, number>>;
  finalHiveBalance?: number;
  finalSignalGrid?: Partial<Record<number, number>>;

  finalPeerEnergy?: Partial<Record<number, number>>;
  finalPeerPc?: Partial<Record<number, number>>;
  finalBondDistances?: Partial<Record<number, number>>;
  finalDamping?: number;
  finalStructureGrid?: Partial<Record<number, number>>;

  branchTaken?: boolean;
  finalBondRequests?: Partial<Record<number, number>>;
  finalHiveEnergyPool?: Partial<Record<number, number>>;
  finalHormones?: number[];
}

export type ReductionCaseDefinition = {
  id: string;
  baselineTraceId: string;
  description: string;
  script: Uint8Array;
  maxSteps: number;
  ownerAtomIdx?: number;
  postStructureTick?: boolean;
  initialRegs?: number[];

  initialProps: Partial<Record<number, number>>;
  initialBondTargets?: Partial<Record<number, number>>;
  initialBondDistances?: Partial<Record<number, number>>;
  initialDamping?: number;
  initialPeerEnergy?: Partial<Record<number, number>>;
  initialPeerPc?: Partial<Record<number, number>>;
  initialCellPeers?: number[];
  initialHiveBalance?: number;
  initialStructureGrid?: Partial<Record<number, number>>;
  initialStructureIntentOwner?: Partial<Record<number, number>>;
  initialStructureIntentValue?: Partial<Record<number, number>>;
  initialHiveMemory?: Partial<Record<number, number>>;
  initialHormones?: number[];
  initialHiveEnergyPool?: Partial<Record<number, number>>;
  nativeProgram?: string; // Key in GENESIS_PROGRAMS
  expected: ReductionCaseExpectation;
}

export type AtomicLedgerEvent = {
  tick: number;
  atomIdx: number;
  r1: number;
  r2: number;
}

export type LedgerChainReportInternal = {
  ok: boolean;
  checkedEvents: number;
  chainAnchoredEvents: number;
  legacyEvents: number;
  failures: string[];
  tailEventHash: string | null;
}

export type CheckpointChainReportInternal = {
  ok: boolean;
  checkedRows: number;
  chainAnchoredRows: number;
  legacyRows: number;
  failures: string[];
  tailCheckpointHash: string | null;
}

export type GlyphTransportEvidence = {
  active: boolean;
  regime: string;
  dominantRole: string;
  sourceMode: string;
  amplitudeBand: string;
  signature: string;
  title: string;
  body: string;
  summary: string;
  metabolicPressure: number;
}

export type HormoneRegimeEvidence = {
  signature: string;
  title: string;
  body: string;
  summary: string;
}

export type ScriptToGlyphOptions = {
  allowUnmapped?: boolean;
  maxSteps?: number;
}

export type BehaviorRuntime = {
  survivalCurve: number[];
  lastTick: number;
  memberCount: number;
  dominantRole: number;
  genomeSamples: string[];
  fingerprint: BehaviorFingerprint;
}

export type Aggregate = {
      memberCount: number;
      replicateTotal: number;
      signalTotal: number;
      buildTotal: number;
      roleCounts: number[];
      genomeSamples: string[];
    }

export type MutationLane =
  | "internal_oracle"
  | "internal_host"
  | "internal_wasm"
  | "canonical_gate"
  | "external_ingress"
  | "external_daemon";

export type MutationEvent = {
  lane: MutationLane;
  kind: string;
  count?: number;
}

export type MeshForwardAction = "DROP_PHEROMONE" | "INJECT_PLASMID";

export type MeshForwardEnvelope = {
  action_type: MeshForwardAction;
  payload: {
    target_x: number;
    target_y: number;
    intensity: number;
    hex_code?: string;
  };
}

export type ParsedMeshInject = {
  envelope: MeshForwardEnvelope;
  signalType: "mesh_pheromone" | "mesh_plasmid";
  eventId: string;
  sourcePeer: string;
}

export type TelemetrySample = {
  ts: number;
  tick: number;
  population: number;
  avgEnergy: number;
  neuralCoherence: number;
  spatialOverflowRatio: number;
  daemonSafeMode: boolean;
}

export type TelemetryMetricName =
  | "population"
  | "avgEnergy"
  | "neuralCoherence"
  | "spatialOverflowRatio";

export type TelemetryBucket = {
  from: number;
  to: number;
  count: number;
}

export type TelemetryHistogram = {
  metric: TelemetryMetricName;
  windowMs: number;
  count: number;
  min: number;
  max: number;
  buckets: TelemetryBucket[];
}

export const SIGNAL_TYPES = [
  "offer",
  "answer",
  "candidate",
  "plasmid",
  "pheromone",
  "telemetry",
] as const;

export type SignalType = typeof SIGNAL_TYPES[number];

export type JsonMap = Record<string, unknown>;

export type SignalingSession = {
  socket: WebSocket;
  roomId: string | null;
  peerId: string | null;
}
export type PhysiologySnapshot = {
  tick: number;
  hormones: Record<string, HormoneSnapshot>;
  ledger: Record<string, LedgerSnapshot>;
};

export type Relic = {
  id: string;
  bytecode: number[];
  role: number;
  resonance: number;
  energy: number;
  extractedAtTick: number;
};

export type CrisisIntent = {
  kind: "crisis";
  logicBytes: Uint8Array;
};

export type FederateIntent = {
  kind: "federate";
  packet: Uint8Array;
  sourceNode: string;
};

export type FederationPolicyFragmentSource =
  | "rule_genome"
  | "behavior"
  | "codex";

export type FederationPolicyFragmentMode = "tax" | "subsidy";

export type FederationPolicyFragment = {
  id: string;
  source: FederationPolicyFragmentSource;
  mode: FederationPolicyFragmentMode;
  reason: string;
  scoreDelta: number;
  energyRatio: number;
  resonanceRatio: number;
};

export type ControlIntent =
  | CrisisIntent
  | FederateIntent
  | MutateIntent
  | AvatarIntent
  | PlasmidIntent
  | SnapshotImportIntent;

export type QueueDecision = {
  ok: boolean;
  status: number;
  reason: string;
  size: number;
  max: number;
  admission?: FederationAdmissionSnapshot;
};

export type ApplyStats = {
  drained: number;
  applied: number;
  failed: number;
  remaining: number;
};
