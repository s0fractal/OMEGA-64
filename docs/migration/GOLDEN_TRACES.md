# Golden Traces

> Stage 2 scaffold. Baseline scenarios are defined here before any runtime
> ownership moves toward reduction.

## Purpose

Golden traces are the control specimens for migration. They make "looks similar"
unacceptable and replace it with measurable drift.

Every reduction bridge step must point at one trace id and one rollback target.

## Current status

| Item                        | Status      | Notes                                                                                                                                                        |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scenario catalog            | complete    | fourteen baseline scenarios defined                                                                                                                          |
| Artifact naming             | complete    | future captures have fixed paths                                                                                                                             |
| Drift-budget policy         | complete    | strict vs bounded metrics defined                                                                                                                            |
| Observer capture harness    | complete    | `verification/golden_trace_capture.ts` now captures both system telemetry/control scenarios and standalone control specimens                                 |
| Persisted baseline captures | complete    | all fourteen `verification/traces/gt01..gt14/*` artifacts have been written and are now export-visible                                                       |
| Shadow consumers            | in progress | reduction shadow consumes `gt01`/`gt03`/`gt04`/`gt05`/`gt08`/`gt09`/`gt10`/`gt11`/`gt12`/`gt13`/`gt14`, while admission shadow consumes `gt04`/`gt06`/`gt07` |

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
- `gt10_share_transfer`
- `gt11_collective_banking`
- `gt12_collective_synchrony`
- `gt13_structure_lock_progress`
- `gt14_structure_charge_resolution`
- `gt15_structure_charge_competition`
- `gt16_runtime_build_materialization`
- `gt17_runtime_build_competition`
- `gt18_runtime_build_stale_lock`
- `gt19_tensegrity_kinematics`

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
  - `population`: absolute drift <= `1` unless the scenario is
    mutation/admission sensitive

If a scenario cannot satisfy these bounds, it is not a valid bridge candidate
yet.

## Scenario catalog

| Trace ID                             | Scenario                                           | Setup / Inputs                                                                                                                                                             | Duration                                                     | Metrics Captured                                                                                                        | Baseline Artifact                                                   | Drift Threshold                                                                   | Existing support                                                                                                                                                                    |
| ------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gt01_coldstart_seeded_swarm`        | coldstart / seeded swarm                           | cold boot, deterministic seed swarm, daemon off                                                                                                                            | `256` ticks                                                  | population, avgEnergy, overflow, mutation counts, invariant digest                                                      | `verification/traces/gt01_coldstart_seeded_swarm/trace.json`        | population `strict`, avgEnergy `bounded`, overflow `bounded`, invariants `strict` | `worker_seeded_swarm.ts`, `worker_determinism_capture.ts`                                                                                                                           |
| `gt02_free_run_no_ingress`           | free run without external intervention             | cold boot, no inject, no daemon policy updates                                                                                                                             | `2048` ticks                                                 | population, avgEnergy, overflow, decree shifts, mutation counts                                                         | `verification/traces/gt02_free_run_no_ingress/trace.json`           | tick/decree/mutation `strict`, energy/overflow `bounded`                          | `worker_trend_baseline.ts`, `worker_trend_math.ts`                                                                                                                                  |
| `gt03_pheromone_inject`              | bounded pheromone inject                           | warmup `128` ticks, then one fixed `DROP_PHEROMONE` payload                                                                                                                | `512` ticks total                                            | local response window, population, avgEnergy, overflow, invariant digest                                                | `verification/traces/gt03_pheromone_inject/trace.json`              | inject admission `strict`, energy/overflow `bounded`, invariants `strict`         | REST `/api/inject`, `worker_determinism_capture.ts`                                                                                                                                 |
| `gt04_plasmid_inject`                | durable symbolic ingress                           | warmup `128` ticks, then one fixed `INJECT_PLASMID` payload                                                                                                                | `512` ticks total                                            | accepted/rejected mutation counts, codex snapshot digest, invariant digest, population                                  | `verification/traces/gt04_plasmid_inject/trace.json`                | admission outcome `strict`, mutation counts `strict`, population/energy `bounded` | REST `/api/inject`, `worker_resilience_capture.ts`                                                                                                                                  |
| `gt05_homeostasis_correction`        | external homeostasis correction                    | warmup `256` ticks, then one fixed `/api/homeostasis` update                                                                                                               | `768` ticks total                                            | avgEnergy slope, overflow, homeostasis state digest, mutation counts                                                    | `verification/traces/gt05_homeostasis_correction/trace.json`        | homeostasis update `strict`, energy/overflow `bounded`, mutation counts `strict`  | REST `/api/homeostasis`, `worker_trend_math.ts`                                                                                                                                     |
| `gt06_daemon_admission_case`         | daemon admission / rejection                       | one accepted ingress case + one degraded/rejected case with daemon governance on                                                                                           | event-bounded                                                | admission severity, applied action, codex chronicle digest, dominant invariant digest                                   | `verification/traces/gt06_daemon_admission_case/trace.json`         | severity/action `strict`, codex/invariant digest `strict`                         | `test_daemon_governance_contract.ts`, `/api/codex/invariants`                                                                                                                       |
| `gt07_daemon_policy_block`           | daemon policy block                                | warmup `128` ticks, then one fixed blocked-opcode `INJECT_PLASMID` payload                                                                                                 | `256` ticks total                                            | http status, response reason, latest admission status/reason, mutation counts                                           | `verification/traces/gt07_daemon_policy_block/trace.json`           | status/reason/mutation counts `strict`                                            | `test_daemon_governance_contract.ts`, REST `/api/inject`                                                                                                                            |
| `gt08_structure_intent_visibility`   | same-tick structure intent visibility              | standalone deterministic subprocess capture of contended `BUILD` intents and `OP_SENSE` visibility under `1w` vs `4w` strict execution                                     | `1` tick / subprocess capture                                | strict hash match, sense visibility, conflict cell type/charge, snapshot digest                                         | `verification/traces/gt08_structure_intent_visibility/trace.json`   | hash/sense/type `strict`, charge `bounded`                                        | `test_structure_intent_determinism.ts`, `test_structure_lock_progress.ts`                                                                                                           |
| `gt09_collective_transport`          | standalone collective hive and pheromone semantics | standalone deterministic subprocess capture of `OP_COLLECTIVE` mode `0/1` hive store-load and mode `2` pheromone emit via direct WASM execution                            | `3` execute calls / subprocess capture                       | hive value, loaded reg0, pheromone word, snapshot digest                                                                | `verification/traces/gt09_collective_transport/trace.json`          | hive/reg/pheromone/digest `strict`                                                | `verification/collective_transport_capture.ts`, `test_swarm.ts`, `test_neural_synthesis.ts`                                                                                         |
| `gt10_share_transfer`                | standalone bonded share transfer semantics         | standalone deterministic subprocess capture of `OP_SHARE` successful bonded transfer and empty-bond no-op via direct WASM execution                                        | `2` execute calls / subprocess capture                       | successful sender energy, successful receiver energy, failed sender energy, failed receiver energy, snapshot digest     | `verification/traces/gt10_share_transfer/trace.json`                | all metrics `strict`                                                              | `verification/share_transfer_capture.ts`, `test_metabolism.ts`, `test_symbiosis.ts`                                                                                                 |
| `gt11_collective_banking`            | standalone collective banking semantics            | standalone deterministic subprocess capture of `OP_COLLECTIVE` mode `3` deposit and mode `4` capped withdraw via direct WASM execution                                     | `2` execute calls / subprocess capture                       | final hive balance, depositor energy, withdrawer energy, withdraw reg0, snapshot digest                                 | `verification/traces/gt11_collective_banking/trace.json`            | all metrics `strict`                                                              | `verification/collective_banking_capture.ts`, `test_metabolism.ts`, `test_neural_synthesis.ts`                                                                                      |
| `gt12_collective_synchrony`          | standalone collective synchrony semantics          | standalone deterministic subprocess capture of `OP_COLLECTIVE` mode `5` bonded phase-lock and mode `6` local quorum PC sync via direct WASM execution                      | `2` execute phases / subprocess capture                      | phase peer1 pc, phase peer2 pc, quorum peer1 pc, quorum peer2 pc, quorum outsider pc, snapshot digest                   | `verification/traces/gt12_collective_synchrony/trace.json`          | all metrics `strict`                                                              | `verification/collective_synchrony_capture.ts`, `test_swarm.ts`, `test_structure_lock_progress.ts`                                                                                  |
| `gt13_structure_lock_progress`       | standalone structure stale-lock progress           | standalone deterministic subprocess capture of `OP_SENSE` visibility through a stale structure lock plus `tick_structure_grid` intent clearing                             | `2` execute phases + `1` structure tick / subprocess capture | visible sense reg, typed miss sense reg, resolved cell type, resolved cell charge, snapshot digest                      | `verification/traces/gt13_structure_lock_progress/trace.json`       | all metrics `strict`                                                              | `verification/structure_lock_capture.ts`, `test_structure_lock_progress.ts`                                                                                                         |
| `gt14_structure_charge_resolution`   | standalone structure charge resolution             | standalone deterministic subprocess capture of `OP_PLUG` publishing a charge intent and `tick_structure_grid` resolving it into a concrete charged structure cell          | `1` execute phase + `1` structure tick / subprocess capture  | charge intent before tick, resolved cell type, resolved cell charge, snapshot digest                                    | `verification/traces/gt14_structure_charge_resolution/trace.json`   | all metrics `strict`                                                              | `verification/structure_charge_capture.ts`, `test_structure_lock_progress.ts`, `test_neural_synthesis.ts`                                                                           |
| `gt15_structure_charge_competition`  | standalone structure charge competition            | standalone deterministic subprocess capture of two `OP_PLUG` publications hitting the same cell in both `low->high` and `high->low` orderings                              | `4` execute calls + `1` structure tick / subprocess capture  | low->high charge intent, high->low charge intent, low->high resolved charge, high->low resolved charge, snapshot digest | `verification/traces/gt15_structure_charge_competition/trace.json`  | all metrics `strict`                                                              | `verification/structure_charge_competition_capture.ts`, `verification/structure_charge_capture.ts`, `test_structure_lock_progress.ts`                                               |
| `gt16_runtime_build_materialization` | runtime structure build materialization            | worker-backed deterministic subprocess capture of a single architect executing `OP_BUILD SOURCE` through `PULSE.tick`                                                      | `1` pulse tick / subprocess capture                          | target resolved type, target resolved charge, owner intent after tick, value intent after tick, snapshot digest         | `verification/traces/gt16_runtime_build_materialization/trace.json` | all metrics `strict`                                                              | `verification/structure_build_runtime_capture.ts`, `test_neural_synthesis.ts`, `test_structure_intent_determinism.ts`                                                               |
| `gt17_runtime_build_competition`     | runtime structure build competition                | worker-backed deterministic subprocess capture of two architects publishing competing `OP_BUILD SOURCE` intents into the same cell through `PULSE.tick`                    | `1` pulse tick / subprocess capture                          | target resolved type, target resolved charge, target resolved state, owner intent after tick, snapshot digest           | `verification/traces/gt17_runtime_build_competition/trace.json`     | all metrics `strict`                                                              | `verification/structure_build_competition_capture.ts`, `verification/structure_build_runtime_capture.ts`, `test_structure_intent_determinism.ts`                                    |
| `gt18_runtime_build_stale_lock`      | runtime structure build stale-lock fallback        | worker-backed deterministic subprocess capture of a single architect attempting `OP_BUILD SOURCE` into a cell carrying a stale locked `SOURCE` intent through `PULSE.tick` | `1` pulse tick / subprocess capture                          | target resolved type, target resolved charge, target resolved state, owner intent after tick, snapshot digest           | `verification/traces/gt18_runtime_build_stale_lock/trace.json`      | all metrics `strict`                                                              | `verification/structure_build_lock_capture.ts`, `verification/structure_build_runtime_capture.ts`, `verification/structure_lock_capture.ts`, `test_structure_intent_determinism.ts` |
| `gt19_tensegrity_kinematics`         | standalone tensegrity kinematics and bonding       | standalone deterministic capture of `OP_TENSEGRITY` setting bond distances and damping, executing physics to resolve forces                                                | `100` physics ticks execution / subprocess capture           | final distance, final damping, snapshot digest                                                                          | `verification/traces/gt19_tensegrity_kinematics/trace.json`         | final damping / digest `strict`, final distance `bounded`                         | `verification/tensegrity_capture.ts`, `test_tensegrity.ts`                                                                                                                          |

## Capture rules

For each golden trace:

1. daemon must be off unless the scenario explicitly tests daemon governance,
2. control inputs must be fixed and serialized in `notes.md`,
3. the same runtime policy env must be recorded,
4. if codex is enabled, codex snapshot and invariant digest must be persisted
   with the trace,
5. any scenario that crosses an epoch boundary must record the exact epoch tick
   in the baseline.

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
- the next implementation step can reference a trace id instead of hand-waving
  about "similar enough".

Current exit assessment:

- scenario procedures: satisfied
- artifact persistence: satisfied
- export visibility: satisfied
- next blocker: widen shadow consumers only when they map to a real trace id and
  an explicit rollback path
