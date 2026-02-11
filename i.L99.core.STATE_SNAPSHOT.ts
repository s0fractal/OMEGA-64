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
 * DeltaProposal: A request from an agent to modify the state.
 */
export interface DeltaProposal {
    proposal_id: string; // UUID or unique semantic ID
    tick: number; // Must match StateSnapshot.tick
    base_state_hash: string; // Must match StateSnapshot.state_hash
    agent_id: string; // Who is proposing?
    intent: string; // Human-readable intent
    confidence: number; // float32 (0..1)
    delta: Array<{ level: number, value: number }>; // Sparse delta: level (0-63), value (int16)
    cost_estimate: number; // uint64
    artifact_hash: string; // Identity anchor of the agent's internal state
    semantic_fingerprint: string; // hex32 - Semantic drift metric
    causal_refs?: string[]; // hex32[] - Optional lineage anchors
}

/**
 * GateConfig: Configuration for the L32 Gate.
 */
export interface GateConfig {
    max_abs_delta_per_level: number; // uint16
    max_total_abs_delta_per_tick: number; // uint32
    max_cost_per_agent: number; // uint64
    reliability_weight: Map<string, number>; // agent_id -> weight (0..1)
    dry_run: boolean; // If true, state is NOT mutated
}

/**
 * GateDecision: The result of the L32 Gate processing.
 */
export interface GateDecision {
    accepted_proposals: string[]; // IDs of accepted proposals
    rejected_proposals: Array<{ proposal_id: string, reason: string }>;
    budget_used: number; // uint32
    cost_used: number; // uint64
    accepted_delta: Array<{ level: number, value: number }>; // The final merged delta
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
    accepted_delta: Array<{ level: number, value: number }>;
    proposal_digest: string; // Hash of all proposals (for integrity)
    accepted_proposals: string[];
    rejected_proposals: Array<{ proposal_id: string, reason: string }>;
    cost_total: number;
    budget_used: number;
    budget_limit?: number; // max_total_abs_delta_per_tick used by the gate
    gate_config_version: string;
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
    witness?: string;
}

export type TopologyEvent = LedgerEvent | ViolationEvent | CanonizationEvent | DecrystallizationEvent;

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
    OUT_OF_RANGE_VALUE: "OUT_OF_RANGE_VALUE"
};
