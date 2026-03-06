# Golden Traces

> Stage 2 scaffold. Baseline scenarios are defined here before any runtime ownership moves toward reduction.

## Purpose

Golden traces are the control specimens for migration. They make "looks similar" unacceptable and replace it with measurable drift.

Every reduction bridge step must point at one trace id and one rollback target.

## Current status

| Item | Status | Notes |
| --- | --- | --- |
| Scenario catalog | complete | nine baseline scenarios defined |
| Artifact naming | complete | future captures have fixed paths |
| Drift-budget policy | complete | strict vs bounded metrics defined |
| Observer capture harness | complete | `verification/golden_trace_capture.ts` now captures both system telemetry/control scenarios and standalone control specimens |
| Persisted baseline captures | complete | all nine `verification/traces/gt01..gt09/*` artifacts have been written and are now export-visible |
| Shadow consumers | in progress | reduction shadow consumes `gt01`/`gt03`/`gt04`/`gt05`/`gt08`/`gt09`, while admission shadow consumes `gt04`/`gt06`/`gt07` |

## Artifact layout

Each baseline trace will eventually persist under:

- `verification/traces/<trace-id>/trace.json`
- `verification/traces/<trace-id>/codex_snapshot.json`
- `verification/traces/<trace-id>/invariants.json`
- `verification/traces/<trace-id>/notes.md`

Committed baseline set now exists for:

- `gt01_coldstart_seeded_swarm`
- `gt02_free_run_no_ingress`
- `gt03_pheromone_inject`
- `gt04_plasmid_inject`
- `gt05_homeostasis_correction`
- `gt06_daemon_admission_case`
- `gt07_daemon_policy_block`
- `gt08_structure_intent_visibility`
- `gt09_collective_transport`

Minimal `trace.json` payload:

- `trace_id`
- `scenario`
- `seed`
- `tick_start`
- `tick_end`
- `metrics`
- `event_log_digest`
- `codex_snapshot_digest`
- `invariant_digest`
- `runtime_mode`

## Drift-budget policy

Metrics are split into two classes:

- `strict`: must match exactly between legacy and bridge/shadow runs
- `bounded`: may drift within a stated numeric envelope

Initial policy:

- `strict`
  - tick count
  - accepted / rejected mutation counts
  - decree shifts
  - admission outcome
  - codex/invariant digests when LLM-free and daemon-free
- `bounded`
  - `avgEnergy`: absolute drift <= `max(1 raw unit, 2%)`
  - `spatialOverflowRatio`: absolute drift <= `0.01`
  - `population`: absolute drift <= `1` unless the scenario is mutation/admission sensitive

If a scenario cannot satisfy these bounds, it is not a valid bridge candidate yet.

## Scenario catalog

| Trace ID | Scenario | Setup / Inputs | Duration | Metrics Captured | Baseline Artifact | Drift Threshold | Existing support |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `gt01_coldstart_seeded_swarm` | coldstart / seeded swarm | cold boot, deterministic seed swarm, daemon off | `256` ticks | population, avgEnergy, overflow, mutation counts, invariant digest | `verification/traces/gt01_coldstart_seeded_swarm/trace.json` | population `strict`, avgEnergy `bounded`, overflow `bounded`, invariants `strict` | `worker_seeded_swarm.ts`, `worker_determinism_capture.ts` |
| `gt02_free_run_no_ingress` | free run without external intervention | cold boot, no inject, no daemon policy updates | `2048` ticks | population, avgEnergy, overflow, decree shifts, mutation counts | `verification/traces/gt02_free_run_no_ingress/trace.json` | tick/decree/mutation `strict`, energy/overflow `bounded` | `worker_trend_baseline.ts`, `worker_trend_math.ts` |
| `gt03_pheromone_inject` | bounded pheromone inject | warmup `128` ticks, then one fixed `DROP_PHEROMONE` payload | `512` ticks total | local response window, population, avgEnergy, overflow, invariant digest | `verification/traces/gt03_pheromone_inject/trace.json` | inject admission `strict`, energy/overflow `bounded`, invariants `strict` | REST `/api/inject`, `worker_determinism_capture.ts` |
| `gt04_plasmid_inject` | durable symbolic ingress | warmup `128` ticks, then one fixed `INJECT_PLASMID` payload | `512` ticks total | accepted/rejected mutation counts, codex snapshot digest, invariant digest, population | `verification/traces/gt04_plasmid_inject/trace.json` | admission outcome `strict`, mutation counts `strict`, population/energy `bounded` | REST `/api/inject`, `worker_resilience_capture.ts` |
| `gt05_homeostasis_correction` | external homeostasis correction | warmup `256` ticks, then one fixed `/api/homeostasis` update | `768` ticks total | avgEnergy slope, overflow, homeostasis state digest, mutation counts | `verification/traces/gt05_homeostasis_correction/trace.json` | homeostasis update `strict`, energy/overflow `bounded`, mutation counts `strict` | REST `/api/homeostasis`, `worker_trend_math.ts` |
| `gt06_daemon_admission_case` | daemon admission / rejection | one accepted ingress case + one degraded/rejected case with daemon governance on | event-bounded | admission severity, applied action, codex chronicle digest, dominant invariant digest | `verification/traces/gt06_daemon_admission_case/trace.json` | severity/action `strict`, codex/invariant digest `strict` | `test_daemon_governance_contract.ts`, `/api/codex/invariants` |
| `gt07_daemon_policy_block` | daemon policy block | warmup `128` ticks, then one fixed blocked-opcode `INJECT_PLASMID` payload | `256` ticks total | http status, response reason, latest admission status/reason, mutation counts | `verification/traces/gt07_daemon_policy_block/trace.json` | status/reason/mutation counts `strict` | `test_daemon_governance_contract.ts`, REST `/api/inject` |
| `gt08_structure_intent_visibility` | same-tick structure intent visibility | standalone deterministic subprocess capture of contended `BUILD` intents and `OP_SENSE` visibility under `1w` vs `4w` strict execution | `1` tick / subprocess capture | strict hash match, sense visibility, conflict cell type/charge, snapshot digest | `verification/traces/gt08_structure_intent_visibility/trace.json` | hash/sense/type `strict`, charge `bounded` | `test_structure_intent_determinism.ts`, `test_structure_lock_progress.ts` |
| `gt09_collective_transport` | standalone collective hive and pheromone semantics | standalone deterministic subprocess capture of `OP_COLLECTIVE` mode `0/1` hive store-load and mode `2` pheromone emit via direct WASM execution | `3` execute calls / subprocess capture | hive value, loaded reg0, pheromone word, snapshot digest | `verification/traces/gt09_collective_transport/trace.json` | hive/reg/pheromone/digest `strict` | `verification/collective_transport_capture.ts`, `test_swarm.ts`, `test_neural_synthesis.ts` |

## Capture rules

For each golden trace:

1. daemon must be off unless the scenario explicitly tests daemon governance,
2. control inputs must be fixed and serialized in `notes.md`,
3. the same runtime policy env must be recorded,
4. if codex is enabled, codex snapshot and invariant digest must be persisted with the trace,
5. any scenario that crosses an epoch boundary must record the exact epoch tick in the baseline.

## Existing support signals

Useful existing support files to draw from:

- `worker_determinism_capture.ts`
- `worker_resilience_capture.ts`
- `worker_seeded_swarm.ts`
- `worker_trend_baseline.ts`
- `worker_trend_math.ts`
- `verification/golden_trace_capture.ts`
- `test_structure_intent_determinism.ts`
- `test_structure_lock_progress.ts`

## Exit condition for this document

This file is actionable when:

- each baseline scenario has a concrete reproducible procedure,
- baseline artifacts are named,
- acceptable drift thresholds are explicit,
- the next implementation step can reference a trace id instead of hand-waving about "similar enough".

Current exit assessment:

- scenario procedures: satisfied
- artifact persistence: satisfied
- export visibility: satisfied
- next blocker: widen shadow consumers only when they map to a real trace id and an explicit rollback path
