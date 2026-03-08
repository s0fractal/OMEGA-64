# i.L32.core.CANON_CAUSAL_BRIDGE

Status: Draft\
Layer: L32 (Integration Band)\
Purpose: Minimal runtime bridge from canon causal invariants to agent decisions.

## 1. Input Signal

Source:

1. `/Users/s0fractal/OMEGA/i.L99.core.REPLAY_AUDIT.ts`
2. `ReplayAuditResult.invariantReport`

Payload:

1. `index_chain_checked: boolean`
2. `index_chain_ok: boolean`
3. `index_chain_checked_records: number`
4. `index_chain_failures: string[]`
5. `gate_admission_index_chain_checked: boolean`
6. `gate_admission_index_chain_ok: boolean`

Proposal routing:

1. `target_path=LOCAL` (default drift path)
2. `target_path=CANON` (canon-bound path)

## 2. L32 Interpretation

L32 maps invariant state to one bridge mode:

1. `GREEN`: canon + gate admission chains checked and ok
2. `AMBER`: any required chain unchecked
3. `RED`: any required chain checked but failing

## 3. Required Runtime Behavior

1. In `GREEN` mode:
   - permit canon-linked operations.
   - permit merge paths that can emit canon anchors.
2. In `AMBER` mode:
   - permit local drift and simulation.
   - deny canon-bound proposals until replay provides chain evidence.
3. In `RED` mode:
   - block canon-bound proposals and cross-agent merge to canon path.
   - treat system as causally unsafe until replay is green.

## 4. Deterministic Guard (Normative)

Before any canon-bound action at L32:

1. run replay in target window,
2. read `invariantReport`,
3. apply mode mapping (`GREEN|AMBER|RED`),
4. gate action by mode rules above.

No heuristic override is allowed for `RED`.

## 5. Failure Vocabulary Pass-Through

L32 must preserve `index_chain:*` failures from replay without rewriting reason
text.

Examples:

1. `index_chain:INDEX_CHAIN_PREV_MISMATCH_AT_LINE_N`
2. `index_chain:INDEX_RECORD_HASH_MISMATCH_AT_LINE_N`
3. `index_chain:INDEX_TICK_NON_MONOTONIC_AT_LINE_N`
4. `index_chain:INDEX_DUPLICATE_REPORT_HASH_AT_LINE_N`
5. `gate_admission_index_chain:INDEX_RECORD_HASH_MISMATCH_AT_LINE_N`

## 6. Bridge Principle

L32 does not define canon truth.\
L32 only enforces membrane behavior:

1. local agents can drift,
2. canon path requires causal integrity.

## 7. Caller Helper

Runtime callers can use:

1. `/Users/s0fractal/OMEGA/i.L32.core.GATE_RUNTIME_CONTEXT.ts`

APIs:

1. `fromInvariantReport(...)` for direct invariant injection,
2. `fromReplayAudit(...)` to derive runtime context from replay automatically.

Policy note: `fromReplayAudit(...)` defaults `verifyLedgerChain` from
crystallization policy unless caller overrides it explicitly.
