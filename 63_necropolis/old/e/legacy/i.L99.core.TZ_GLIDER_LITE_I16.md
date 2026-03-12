# i.L99.core.TZ_GLIDER_LITE_I16

Status: Draft for Implementation Owner: OMEGA Bio-Representative + Agent Swarm
Layer: L99 (Canon Guidance)

## 1. Objective

Introduce a controlled `glider-lite` runtime in OMEGA where lightweight agents:

- observe shared topological state,
- propose bounded signed vector deltas in `i16`,
- evolve via append-only traces,
- do not directly rewrite canon.

This is not AGI work. This is topology instrumentation and safe agency
scaffolding.

## 2. Why Internal Logical Coherence is B+ (not A)

Current gaps:

1. Metric mismatch: `hash distance` is treated as semantic distance in multiple
   discussions. Cryptographic hash distance is identity-level, not
   meaning-level.
2. Layer leakage: deterministic claims and metaphorical claims are mixed in one
   control path.
3. Missing formal gate: there is no strict protocol between `resonant proposals`
   and `deterministic application`.
4. Unbounded dipole: `maximize tension` appears without hard energy budget and
   safety clamp.

Upgrade target to `A`:

- formalize gate contract,
- formalize ledger schema,
- formalize energy/phase budgets,
- separate symbolic narrative from executable semantics.

## 3. Scope

In scope:

- Shared `i16` state vector model and update discipline.
- Proposal-only agent interface (no direct mutation rights).
- L32 gate for admission, clipping, and deterministic application.
- Append-only ledger for irreversibility and replay.
- Acceptance tests and failure modes.

Out of scope:

- Full self-rewrite of topology.
- Claims about machine consciousness.
- Large closed-model introspection.

## 4. Architecture (Minimal)

Flow:

1. `State(t)` is read by agents.
2. Each agent emits a `DeltaProposal`.
3. L32 gate validates, clips, and merges proposals.
4. `State(t+1)` is produced deterministically.
5. Transition is appended to ledger.

Separation rule:

- Agent layer is stochastic/exploratory.
- Gate + merge + replay are deterministic.

## 5. Data Model

State vector:

- `state_i16: int16[64]`
- Optional projections: `phase_u16[64]`, `stability_q15[64]`, `entropy_i16[64]`.

Delta proposal:

- sparse vector form: `[{ level: 0..63, delta: int16 }]`
- plus metadata: `intent`, `confidence`, `cost_estimate`, `agent_id`, `tick`.

## 6. Core Invariants

1. Causality: state transition order is strictly monotonic by `tick`.
2. Bounded energy: sum of absolute accepted deltas per tick must be <= budget.
3. Bounded phase jump: per-level delta clamp to configured max.
4. Replayability: replaying ledger from genesis reproduces state bit-exactly.
5. No direct canon mutation: agent outputs cannot bypass L32 gate.

## 7. Admission and Merge Rules

Admission:

1. Schema-valid proposal.
2. Correct `tick` and known `agent_id`.
3. Numeric bounds are valid.
4. Proposal cost <= per-agent budget.

Merge:

1. Aggregate sparse deltas by level.
2. Apply weighted combine by confidence and reliability.
3. Saturating clamp to int16.
4. Apply global budget scaling if overflow.
5. Emit deterministic `accepted_delta`.

## 8. Cost Function (Operational)

Per-level operational cost:
`cost_l = abs(delta_l) * (1 + load_l) * (1 + mismatch_l)`

Where:

- `load_l` comes from hybrid load model.
- `mismatch_l` is phase mismatch penalty (0..2 normalized domain).

Total cost: `cost = sum(cost_l)`

## 9. Identity and Drift (Safe Form)

Use three channels:

1. `artifact_hash`: identity anchor and portal to exact artifact state.
2. `causal_position`: position in hash-linked transformation graph (parent/child
   lineage).
3. `semantic_fingerprint`: embedding-derived, task-calibrated behavior
   signature.

Rules:

1. Cryptographic hash bit-distance is not semantic distance.
2. Causal drift is computed on graph paths between anchors, not on raw hash
   bits.
3. Semantic drift is computed from behavior/projection metrics.

## 10. Ledger Requirements

Append-only event per tick:

- `before_hash`, `after_hash`
- `causal_refs` (optional parent anchors)
- `accepted_delta`
- `proposal_digest`
- `cost`
- `budget_used`
- `witness` (optional)

Ledger must support:

- replay,
- rollback by checkpoint,
- drift analytics.

## 11. Phased Delivery

Phase 0: instrumentation only, no mutations.

Phase 1: proposal + gate + ledger with zero-impact dry-run.

Phase 2: bounded state mutation enabled.

Phase 3: multi-agent competition/cooperation with budgets and reliability
scores.

## 12. Acceptance Criteria

1. Deterministic replay: same ledger produces same final state.
2. Safety: no level exceeds int16 bounds.
3. Stability: no uncontrolled divergence under random proposal noise test.
4. Separation: agent cannot modify state without gate.
5. Observability: every transition has explainable accepted delta and cost.

## 13. Risks

1. Pseudoscience drift: metaphor replacing instrumentation.
2. Overfitting gate: too strict -> no emergence, too loose -> collapse.
3. Semantic lock-in: hardcoding intent categories too early.

## 14. Implementation Note

Use existing OMEGA terms and files:

- `i.L32.core.RIBOSOME.ts` as execution bridge candidate.
- `i.L99.core.LOAD_MODEL.md` for load semantics.
- `i.L99.core.SPEC_OMEGA_ENV.md` for canon-level constraints.
