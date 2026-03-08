# i.L99.core.CRYSTALLIZATION_THRESHOLD

Status: Draft Intent: Measurable transfer gate from drift field to canon
candidate. Scope: Post-implementation operational policy.

## 1. Precondition Blocker

Crystallization cannot be evaluated as canonical while `state_after_hash` is
non-deterministic.

Required rule:
`state_after_hash = H(state_i16 || tick || gate_config_version || proposal_digest)`

Non-acceptable for crystallization:

- wall-clock seeded hash generation,
- random source in hash path,
- unordered proposal digest.

## 2. Hard Gates (Mandatory)

All must be true:

1. Replay Green: 100% deterministic replay match on 3 independent runs.
   Projection replay report MUST have `failCount = 0` for the same window.
   Projection drift gate MUST pass:
   `max(driftByLevelP95) <= projectionDriftMaxP95` and
   `max(driftSlopeByLevelP95) <= projectionDriftSlopeMaxP95`. Default runtime
   values are defined in: `i.L99.core.CRYSTALLIZATION_CONFIG.ts`. Ledger
   hash-chain verification MUST be enabled according to policy
   (`verifyLedgerChain`) during crystallization replay audit. Policy version
   MUST be persisted in emitted events as `policy_version`. Policy hash MUST be
   persisted in emitted events as `policy_hash`. Policy change is valid only via
   explicit `POLICY_TRANSITION_EVENT`. Canonization MUST persist
   `crystallization_report_hash` and `crystallization_report_version`.
   Canonization SHOULD persist `crystallization_report_uri` to materialized
   report. Canonization SHOULD persist gate admission report anchors when
   available: `gate_admission_report_version`, `gate_admission_report_hash`,
   `gate_admission_report_uri`.

2. Critical Safety: `CRITICAL VIOLATION_EVENT = 0` in stability window.

3. Gate Exclusivity: no state mutation outside `L32 gate`.

4. Causal Consistency: all `BASE_HASH_MISMATCH` proposals are rejected and never
   applied.

5. Ledger Integrity: append-only history with valid hash chain and checkpoint
   continuity.

## 3. Soft Gates (Stability Metrics)

Recommended default window: `W = 512` ticks.

Metrics:

1. Budget pressure: `p95(budget_used / max_total_abs_delta_per_tick) <= 0.70`

2. Drift slope: `p95(abs(delta_level_per_tick)) <= 8` (i16 units/tick) Optional
   projection slope: `max(driftSlopeByLevelP95) <= driftSlopeMaxP95` from
   `PROJECTION_DRIFT_ANALYTICS` when policy enables it.

3. Sign-flip rate: for active levels, `flip_rate <= 0.25`

4. Rejection ratio: `rejected / total <= 0.30` (excluding explicit noise tests)

5. Energy density: `p99(cost_total / max(1, abs_delta_sum)) <= 3 * median`

6. Tick continuity: no missing or duplicated tick IDs in window.

## 4. Crystallization Decision Rule

An artifact is marked `crystallized_candidate` when:

1. All Hard Gates pass.
2. At least 5 of 6 Soft Gates pass.
3. Conditions hold for 3 consecutive windows `W`.
4. A final independent replay audit is green.

Then emit: `CANONIZATION_EVENT`.

## 5. Canonization Payload (Minimum)

```json
{
  "event_type": "CANONIZATION_EVENT",
  "artifact_hash": "hex32",
  "state_hash": "hex32",
  "proposal_digest": "hex32",
  "checkpoint_tick": 0,
  "window": 512,
  "hard_gates": "PASS",
  "soft_gates_passed": 5,
  "witness": "optional_hex32"
}
```

## 6. De-Crystallization Rule

If any Hard Gate fails after crystallization:

1. mark artifact as `decrystallized`,
2. emit `DECRYSTALLIZATION_EVENT`,
3. revert to last valid checkpoint,
4. require fresh 3-window qualification.

## 7. Notes

1. This policy evaluates operational stability, not metaphysical truth.
2. Hash acts as identity anchor and causal coordinate.
3. Semantic evaluation remains projection-based and separate from raw hash bit
   distance.
