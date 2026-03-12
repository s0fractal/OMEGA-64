# i.L99.core.CANON_CAUSAL_INVARIANTS

Status: Active\
Layer: L99\
Intent: Deterministic causality contract for canon report lineage.

## 1. Purpose

Canonization must be reproducible not only by payload hash, but by **causal
lineage**.

This contract defines invariant checks for:

1. report artifact integrity,
2. append-only index chain integrity,
3. temporal/causal monotonicity.

## 2. Scope

Artifacts:

1. `./OMEGA_CANON_REPORTS/<report_hash>.json`
2. `./OMEGA_CANON_REPORTS/index.jsonl`

Runtime:

1. `/Users/s0fractal/OMEGA/i.L99.core.CRYSTALLIZATION_REPORT.ts`
2. `/Users/s0fractal/OMEGA/i.L99.core.REPLAY_AUDIT.ts`

## 3. Index Record Invariants

Each index record MUST satisfy:

1. strict parseable JSON line,
2. required schema fields with valid types,
3. `record_hash` is valid lowercase hex SHA-256 (64 chars),
4. `report_hash` is valid lowercase hex SHA-256 (64 chars),
5. `prev_record_hash` is `null` for genesis line or hex hash for linked lines.

## 4. Chain Invariants

For line `i` in `index.jsonl`:

1. `prev_record_hash` MUST equal previous line `record_hash`,
2. recomputed hash of canonical record fields MUST equal `record_hash`,
3. `report_hash` MUST be unique in chain (no duplicates),
4. `tick` MUST be monotonic non-decreasing,
5. `ts_unix_ms` MUST be monotonic non-decreasing.

## 5. Artifact Coupling Invariants

For each index record:

1. `report_path` MUST be readable,
2. report JSON hash MUST equal indexed `report_hash`,
3. canonization event anchor (`crystallization_report_hash`,
   `crystallization_report_uri`) MUST match index record.

## 6. Replay Contract

Replay performs fail-fast index verification before canon report checks.

Replay returns `invariantReport`:

1. `index_chain_checked`
2. `index_chain_ok`
3. `index_chain_checked_records`
4. `index_chain_failures`

If any invariant fails, replay MUST be non-green.

## 7. Failure Code Vocabulary

Canonical failure reasons:

1. `INDEX_LINE_PARSE_FAIL_AT_LINE_N`
2. `INDEX_LINE_SCHEMA_INVALID_AT_LINE_N`
3. `INDEX_CHAIN_PREV_MISMATCH_AT_LINE_N`
4. `INDEX_RECORD_HASH_MISMATCH_AT_LINE_N`
5. `INDEX_REPORT_HASH_MISMATCH_AT_LINE_N`
6. `INDEX_REPORT_READ_FAIL_AT_LINE_N`
7. `INDEX_TICK_NON_MONOTONIC_AT_LINE_N`
8. `INDEX_TS_NON_MONOTONIC_AT_LINE_N`
9. `INDEX_DUPLICATE_REPORT_HASH_AT_LINE_N`

Replay may prefix these with `index_chain:`.

## 8. Operational Rule

`index.jsonl` is append-only.\
Mutation of historical lines is a causal violation and must be detected by
replay.
