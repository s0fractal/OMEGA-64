// i.L99.core.STATE_SNAPSHOT.ts
// 🛡️ OMEGA-64 | Glider Lite | State & Proposal Types
// Normative definitions for the Gemini Glider Lite runtime.

/**
 * StateSnapshot: The canonical state of the system at a specific tick.
 * This is the input for all agents.
 */
export interface StateSnapshot {
  tick: number; // uint64
  state_i16: Int16Array; // int16[64] - The core state vector
  state_hash: string; // hex32 - Identity anchor

  // Optional projections (for observablity)
  phase_u16?: Uint16Array; // uint16[64]
  stability_q15?: Float32Array; // 0..1
  entropy_i16?: Int16Array; // -32768..32767
}

/**
 * AutonomyState: Represents the sovereignty levels of the system.
 */
export interface AutonomyState {
    state: number; // [0..1]
    gov: number;   // [0..1]
    code: number;  // [0..1]
}

/**
 * DeltaProposal: A request from an agent to modify the state.
 */
export interface DeltaProposal {
  proposal_id: string; // UUID or unique semantic ID
  tick: number; // Must match StateSnapshot.tick
  base_state_hash: string; // Must match StateSnapshot.state_hash
  agent_id: string; // Who is proposing?
  agent_phase_u16?: number; // Optional agent phase anchor [0..65535] for LOAD mismatch cost
  intent: string; // Human-readable intent
  confidence: number; // float32 (0..1)
  delta: Array<{ level: number; value: number }>; // Sparse delta: level (0-63), value (int16)
  cost_estimate: number; // uint64
  artifact_hash: string; // Identity anchor of the agent's internal state
  semantic_fingerprint: string; // hex32 - Semantic drift metric
  causal_refs?: string[]; // hex32[] - Optional lineage anchors
  target_path?: "LOCAL" | "CANON"; // optional routing hint for L32 membrane
  signature_scheme?: AgentSignatureScheme; // optional signature scheme marker
  agent_signature?: string; // optional signed envelope for proposal integrity/authenticity
  proposal_envelope_hash?: string; // optional precomputed envelope hash anchor
}

/**
 * GateConfig: Configuration for the L32 Gate.
 */
export interface GateConfig {
  max_abs_delta_per_level: number; // uint16
  max_total_abs_delta_per_tick: number; // uint32
  max_total_cost_per_tick?: number; // uint64 (optional global cost cap)
  max_cost_per_agent: number; // uint64
  reliability_weight: Map<string, number>; // agent_id -> weight (0..1)
  reliability_mode?: "STATIC" | "PHASE_COHERENCE"; // optional admission weighting mode
  reliability_floor?: number; // optional [0..1] floor when PHASE_COHERENCE is active
  dry_run: boolean; // If true, state is NOT mutated
  signature_policy?: SignaturePolicy; // DISABLED (default), OPTIONAL, REQUIRED
  agent_signature_keys?: Map<string, AgentSignatureKey>; // agent_id -> shared verification key
  anti_replay_window_ticks?: number; // reject replays of same proposal envelope within recent window
}

export type AgentSignatureScheme = "ed25519/v1" | "hmac-sha256/v1";
export type SignaturePolicy = "DISABLED" | "OPTIONAL" | "REQUIRED";
export type AgentSignatureKey =
  | { scheme: "ed25519/v1"; public_key_b64: string }
  | { scheme: "hmac-sha256/v1"; secret: string };

/**
 * GateDecision: The result of the L32 Gate processing.
 */
export interface GateDecision {
  accepted_proposals: string[]; // IDs of accepted proposals
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  budget_used: number; // uint32
  cost_used: number; // uint64
  accepted_delta: Array<{ level: number; value: number }>; // The final merged delta
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
  proposal_digest: string; // Hash of all proposals (for integrity)
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
  budget_limit?: number; // max_total_abs_delta_per_tick used by the gate
  gate_config_version: string;
  signature_artifact_hash?: string; // hash anchor of transition artifact (usually proposal_digest)
  signature_tick?: number; // tick used by topological signature builder
  signature_causal_refs?: string[]; // canonical sorted causal refs
  projection_2d_hash?: string; // deterministic 2D projection hash
  thread_1d_hash?: string; // deterministic 1D thread hash
  projection_version?: string; // signature projection version
  policy_version?: string; // crystallization/gate policy version
  policy_hash?: string; // SHA-256 of canonical crystallization policy payload
  chain_version?: string; // ledger hash-chain schema version
  prev_event_hash?: string | null; // hash anchor to previous ledger line
  event_hash?: string; // hash of this event payload + prev_event_hash
  witness?: string;
}

/**
 * ViolationEvent: Logic Halt signal when Red Lines are crossed.
 */
export interface ViolationEvent {
  event_type: "VIOLATION_EVENT";
  tick: number;
  rule_id: string; // e.g., "NO_BYPASS"
  severity: "CRITICAL" | "WARNING";
  state_hash: string;
  details: string;
  action_taken: "HALT_AND_QUARANTINE" | "LOG_ONLY";
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
}

/**
 * CanonizationEvent: Emitted when an artifact becomes Crystal.
 */
export interface CanonizationEvent {
  event_type: "CANONIZATION_EVENT";
  artifact_hash: string;
  state_hash: string;
  proposal_digest: string; // Hash chain proof
  checkpoint_tick: number;
  window: number; // e.g. 512
  hard_gates: "PASS" | "FAIL";
  soft_gates_passed: number; // 0..6
  policy_version?: string; // crystallization policy version
  policy_hash?: string; // SHA-256 of canonical crystallization policy payload
  crystallization_report_version?: string; // report schema version
  crystallization_report_hash?: string; // SHA-256 of canonical crystallization report payload
  crystallization_report_uri?: string; // materialized report path (content-addressed)
  gate_admission_report_version?: string; // gate admission report schema version
  gate_admission_report_hash?: string; // SHA-256 of gate admission report payload
  gate_admission_report_uri?: string; // materialized report path (content-addressed)
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

/**
 * PolicyTransitionEvent: Explicit policy migration in append-only history.
 */
export interface PolicyTransitionEvent {
  event_type: "POLICY_TRANSITION_EVENT";
  tick: number;
  from_policy_version?: string;
  from_policy_hash?: string;
  to_policy_version: string;
  to_policy_hash: string;
  reason: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

/**
 * BridgeModeEvent: L32 membrane trace for canon causal integrity mode.
 * Includes invariant packet hash for lightweight witness exchange.
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

/**
 * DecrystallizationEvent: Emitted when a crystallized artifact loses hard-gate stability.
 */
export interface DecrystallizationEvent {
  event_type: "DECRYSTALLIZATION_EVENT";
  tick: number;
  artifact_hash: string;
  reason: string;
  rollback_to_checkpoint: number;
  rollback_state_hash?: string;
  hard_gate_failure: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

export type TopologyEvent =
  | LedgerEvent
  | ViolationEvent
  | CanonizationEvent
  | DecrystallizationEvent
  | PolicyTransitionEvent
  | BridgeModeEvent;

/**
 * CheckpointRecord: Persistent state snapshot for rollback/replay acceleration.
 */
export interface CheckpointRecord {
  checkpoint_id: string;
  tick: number;
  state_hash: string;
  state_i16: number[]; // serialized Int16Array
  ts_unix_ms: number;
  reason: string;
  witness?: string;
}

// Canonical Rejection Reasons
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
