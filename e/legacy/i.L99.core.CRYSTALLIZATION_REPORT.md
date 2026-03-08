# i.L99.core.CRYSTALLIZATION_REPORT

Status: Draft\
Layer: L99\
Intent: Canonical final artifact for crystallization decisions.

## 1. Purpose

A canonization decision must be reproducible from one deterministic report
artifact.

The report binds:

1. replay audit (including `policyTickReport`),
2. projection replay report,
3. projection drift analytics,
4. policy anchor (`policy_version`, `policy_hash`),
5. gate admission diagnostics (optional).
6. thresholds used for the decision,
7. compact `verification_summary` for fast gate inspection, including gate
   admission and index-chain checks.

## 2. Runtime

Source: `i.L99.core.CRYSTALLIZATION_REPORT.ts`

API:

1. `CRYSTALLIZATION_REPORT.build(input)`
2. `CRYSTALLIZATION_REPORT.hash(report)`
3. `CRYSTALLIZATION_REPORT.buildWithHash(input)`
4. `CRYSTALLIZATION_REPORT.materialize(report, hash, meta)`

Version: `crystallization-report/v1`

## 3. Event Coupling

`CANONIZATION_EVENT` MUST carry:

1. `crystallization_report_version`
2. `crystallization_report_hash`
3. `crystallization_report_uri`
4. `gate_admission_report_version` (when available)
5. `gate_admission_report_hash` (when available)
6. `gate_admission_report_uri` (when available)

This hash is the canonical pointer to the decision artifact.

## 4. Materialization

Default storage:

1. `./OMEGA_CANON_REPORTS/<report_hash>.json`
2. append-only index: `./OMEGA_CANON_REPORTS/index.jsonl`

Rules:

1. report files are content-addressed by hash,
2. existing hash file is immutable (hash conflict is fatal),
3. index is append-only.

## 5. Index Chain Integrity

Each `index.jsonl` record carries:

1. `prev_record_hash`,
2. `record_hash`.

`record_hash` is SHA-256 over canonical record fields (including
`prev_record_hash`), so index lines form an append-only hash chain.

Causality invariants:

1. `tick` is monotonic (non-decreasing),
2. `ts_unix_ms` is monotonic (non-decreasing),
3. `report_hash` is unique in the chain.

Replay audit must fail fast if:

1. chain linkage is broken,
2. index record hash is invalid,
3. index entry points to a missing/tampered report file,
4. index line is malformed or violates record schema.

Replay returns `invariantReport` to expose index-chain check status and failures
at audit level.
