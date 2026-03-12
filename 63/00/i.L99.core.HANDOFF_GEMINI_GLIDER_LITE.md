# i.L99.core.HANDOFF_GEMINI_GLIDER_LITE

Status: Implementation Handoff Target: Gemini (executor) Context: OMEGA
glider-lite with i16 state and deterministic L32 gate.

## 0. Input Set (Read First)

1. `/Users/s0fractal/OMEGA/i.L99.core.TZ_GLIDER_LITE_I16.md`
2. `/Users/s0fractal/OMEGA/i.L32.core.GLIDER_GATE_PROTOCOL.md`
3. `/Users/s0fractal/OMEGA/i.L99.core.LEDGER_EVENT_SCHEMA.md`
4. `/Users/s0fractal/OMEGA/i.L99.core.GLIDER_LITE_ACCEPTANCE.md`
5. `/Users/s0fractal/OMEGA/i.L99.core.SPEC_OMEGA_ENV.md`
6. `/Users/s0fractal/OMEGA/i.L99.core.LOAD_MODEL.md`
7. `/Users/s0fractal/OMEGA/i.L32.core.RIBOSOME.ts`

## 1. Delivery Order

### Phase 0: Instrumentation Only (No Mutation)

Goal: Create observability for proposals and cost without changing shared state.

Deliver:

1. `StateSnapshot` structure (`tick`, `state_i16[64]`, `state_hash`).
2. `DeltaProposal` ingestion path and validation.
3. Ledger writer using schema from `LEDGER_EVENT_SCHEMA`.
4. Dry-run pipeline: proposals in, decision out, state unchanged.

Stop gate:

- All Phase 0 events append correctly.
- Replay checker runs and reports no mutation path.

### Phase 1: Deterministic L32 Gate (Still Dry-Run by Default)

Goal: Implement canonical admission + merge with deterministic ordering.

Deliver:

1. Gate function matching `GLIDER_GATE_PROTOCOL`.
2. Canonical proposal sort by `proposal_id`.
3. Per-level clamp and global budget scaling.
4. Rejection reasons using canonical codes.

Stop gate:

- Deterministic replay test passes repeatedly on same input.
- `dry_run=true` path proven side-effect free.

### Phase 2: Bounded Mutation Enabled

Goal: Enable controlled updates of `state_i16` through gate only.

Deliver:

1. Mutation path guarded by gate result.
2. Saturating add implementation for int16 state updates.
3. Cost accounting wired to load/mismatch model.
4. Checkpoint support for rollback and replay.

Stop gate:

- No int16 overflow under stress.
- Tick integrity (`TICK_MISMATCH`) covered.
- Agent direct-write attempts rejected.

### Phase 3: Multi-Agent Merge and Reliability Weighting

Goal: Run 2-3 lightweight agents with proposal competition/cooperation.

Deliver:

1. Reliability weight map per `agent_id`.
2. Confidence-weighted merge.
3. Noise robustness run (10k ticks) with bounded divergence.
4. Drift analytics from ledger metrics.

Stop gate:

- Acceptance matrix T1..T8 is green.
- Independent replay matches final hash.

## 2. Hard Constraints (Do Not Violate)

1. No direct canon mutation from agent outputs.
2. Do not use raw hash bit-distance as semantic metric. Use hash graph lineage
   for causal drift and semantic fingerprints for meaning drift.
3. No mutation path outside L32 gate.
4. No implicit non-determinism in merge order.
5. No phase without explicit budget.

## 3. Suggested File Placement

1. L32 integration code near: `/Users/s0fractal/OMEGA/i.L32.core.RIBOSOME.ts`
2. L99 ledger and audit helpers near: `/Users/s0fractal/OMEGA/i.L99.core.*`
3. Keep terminology aligned with existing `CANON/SPEC/LOAD`.

## 4. Quick Report Template Per Phase

Use this format:

1. What was implemented.
2. Which acceptance tests passed/failed.
3. Replay determinism status.
4. Open risks and next action.
