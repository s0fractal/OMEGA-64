# Golden Traces

> Planning placeholder. This file defines the baseline scenarios required before bridge work.

## Purpose

Golden traces are the control specimens for migration. They make "looks similar" unacceptable and replace it with measurable drift.

## Scenario catalog

The initial baseline set should contain:

1. coldstart / seeded swarm
2. several thousand ticks without external intervention
3. pheromone inject
4. plasmid inject
5. homeostasis correction
6. daemon admission / rejection case

## Minimum metrics per trace

For every trace capture:

- tick count
- population
- avgEnergy
- spatial overflow
- mutation counts
- decree shifts
- codex snapshot digest
- invariant digest

## Suggested trace metadata schema

| Trace ID | Scenario | Seed / Inputs | Duration | Metrics Captured | Baseline Artifact | Drift Threshold | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Initial worksheet

| Trace ID | Scenario | Seed / Inputs | Duration | Metrics Captured | Baseline Artifact | Drift Threshold | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `trace_coldstart_seeded` | coldstart / seeded swarm | controlled coldstart seed | TBD | population, avgEnergy, overflow, invariants | TBD | TBD | define first |
| `trace_pheromone_inject` | observer membrane influence | one bounded pheromone inject | TBD | energy, overflow, local response | TBD | TBD | define first |
| `trace_plasmid_inject` | durable symbolic ingress | one bounded plasmid inject | TBD | mutation counts, codex, invariants | TBD | TBD | define first |
| `trace_daemon_admission` | daemon accept / reject | one accepted + one rejected case | TBD | governance state, codex, drift | TBD | TBD | define first |

## Existing support signals

Useful existing support files to draw from:

- `worker_determinism_capture.ts`
- `worker_resilience_capture.ts`
- `worker_seeded_swarm.ts`
- `worker_trend_baseline.ts`
- `worker_trend_math.ts`

## Exit condition for this document

This file is ready when:

- each baseline scenario has a concrete reproducible procedure
- baseline artifacts are named
- acceptable drift thresholds are explicit
