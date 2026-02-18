# i.L99.core.GATE_ADMISSION_REPORT

Status: Draft Layer: L99 Intent: Aggregate per-proposal admission metrics
emitted by L32 gate.

## 1. Purpose

Provides a deterministic report over `LedgerEvent.accepted_proposal_metrics`:

1. reliability effectiveness,
2. phase coherence distribution,
3. weight and physical cost distribution,
4. top agent contribution profile.

## 2. Source

1. `/Users/s0fractal/OMEGA/i.L99.core.GATE_ADMISSION_REPORT.ts`
2. Report version: `gate-admission-report/v1`

## 3. Inputs

`GateAdmissionReportOptions`:

1. `startTick` (optional),
2. `endTick` (optional),
3. `topAgents` (optional, default `8`).

## 4. Output Highlights

`GateAdmissionReport` includes:

1. `weightMean`, `weightP95`,
2. `reliabilityEffectiveMean`,
3. `phaseCoherenceMean`, `phaseCoherenceP95` (when available),
4. `outOfPhasePressureMean = mean(1 - phase_coherence)`,
5. `timeline` by tick,
6. `topAgents` ranked by proposal count then mean weight.

## 5. Compatibility

Legacy ledger lines without `accepted_proposal_metrics` are tolerated:

1. they count toward `eventsAnalyzed`,
2. they do not contribute to metric aggregates.

## 6. Materialization

Content-addressed storage:

1. directory: `./OMEGA_GATE_ADMISSION_REPORTS`,
2. file path: `./OMEGA_GATE_ADMISSION_REPORTS/<report_hash>.json`,
3. index: `./OMEGA_GATE_ADMISSION_REPORTS/index.jsonl`.

Index chain guarantees:

1. `prev_record_hash` link integrity,
2. monotonic `tick_anchor`,
3. monotonic `ts_unix_ms`,
4. report-file hash verification (optional in `verifyIndexChain`).
