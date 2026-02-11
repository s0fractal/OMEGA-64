# i.L32.core.GLIDER_GATE_PROTOCOL

Status: Draft
Layer: L32 (Integration Band)
Purpose: Deterministic admission and merge protocol for agent deltas.

## 1. Contract

Input:
- `StateSnapshot`
- `DeltaProposal[]`
- `GateConfig`

Output:
- `GateDecision`
- `AcceptedDelta`
- `StateSnapshotNext`
- `LedgerEvent`

## 2. Types (Normative)

`StateSnapshot`
- `tick: uint64`
- `state_i16: int16[64]`
- `state_hash: hex32`

`DeltaProposal`
- `proposal_id: string`
- `tick: uint64`
- `base_state_hash: hex32`
- `agent_id: string`
- `intent: string`
- `confidence: float32` (0..1)
- `delta: Array<{ level: uint8, value: int16 }>`
- `cost_estimate: uint64`
- `artifact_hash: hex32`
- `semantic_fingerprint: hex32`
- `causal_refs: hex32[]` (optional lineage anchors)
- `target_path: "LOCAL" | "CANON"` (optional; default `LOCAL`)

`GateConfig`
- `max_abs_delta_per_level: uint16`
- `max_total_abs_delta_per_tick: uint32`
- `max_cost_per_agent: uint64`
- `reliability_weight: Map<agent_id, float32>`
- `dry_run: bool`

`GateDecision`
- `accepted_proposals: string[]`
- `rejected_proposals: Array<{ proposal_id: string, reason: string }>`
- `budget_used: uint32`
- `cost_used: uint64`

## 3. Deterministic Procedure

1. Reject proposal if schema invalid.
2. Reject if `proposal.tick != state.tick`.
3. Reject if `proposal.base_state_hash != state.state_hash`.
4. Reject if unknown `agent_id`.
4.1 If `target_path == CANON`, reject unless bridge mode is `GREEN`.
5. Clip each `delta.value` to `max_abs_delta_per_level`.
6. Compute weighted score:
`weight = confidence * reliability_weight[agent_id]`.
7. Merge per level:
`merged[level] = saturating_round(sum(weight * delta_level))`.
8. Enforce global budget:
if total abs exceeds `max_total_abs_delta_per_tick`, scale all levels uniformly.
9. Compute `state_next = saturating_add(state, merged)`.
10. Compute `state_next_hash`.
11. Emit decision + ledger event.

## 4. Rejection Reasons (Canonical)

- `SCHEMA_INVALID`
- `TICK_MISMATCH`
- `BASE_HASH_MISMATCH`
- `UNKNOWN_AGENT`
- `CANON_PATH_REQUIRES_GREEN_BRIDGE`
- `COST_OVER_BUDGET`
- `EMPTY_DELTA`
- `OUT_OF_RANGE_VALUE`

## 5. Safety Rules

1. Gate is the only state mutation path.
2. Gate must be pure for same input set.
3. Merge order must be canonical:
sort proposals by `proposal_id` before merge.
4. `dry_run=true` must produce decision without mutating state.

## 6. Traceability

Each accepted tick must be reconstructible from:
- prior state hash,
- sorted proposal set,
- gate config version.

L32 MUST emit `BRIDGE_MODE_EVENT` every tick with:
1. resolved mode (`GREEN|AMBER|RED`),
2. source invariant snapshot (`index_chain_*`),
3. canon-bound and blocked proposal IDs.

## 7. Hash Semantics (Normative)

1. `artifact_hash` is identity anchor, not meaning metric.
2. Causal drift is computed from lineage edges (`base_state_hash`, `causal_refs`).
3. Semantic drift is external to hash bits and uses projection/behavior metrics.

## 8. Pipeline Entry

Runtime entrypoint:
1. `/Users/s0fractal/OMEGA/i.L32.core.GATE_PIPELINE.ts`

APIs:
1. `processWithReplayContext(...)` (auto bridge context from replay),
2. `processWithInvariantContext(...)` (explicit invariant snapshot).

Minimal runtime wrapper:
1. `/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNNER.ts` via `GATE_RUNNER.step(...)`.
