# Hormone / Ledger Contract

> Stage 7 contract scaffold. This document formalizes the physiological knobs before they are wired into live runtime ownership.

## Purpose

Stage 7 needs two explicit layers:

- `HORMONE_BUFFER`: the current global physiological field
- `GENETIC_LEDGER`: the bounded registry of mutable global constants

The point is not "more configuration". The point is to stop letting important
global knobs live as disconnected ad-hoc controller state.

## Current code-backed scaffold

The Stage 7 code-backed surface now exists in:

- [HORMONE_BUFFER.ts](/Users/s0fractal/OMEGA/HORMONE_BUFFER.ts)
- [GENETIC_LEDGER.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER.ts)
- [GENETIC_LEDGER_RUNTIME.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER_RUNTIME.ts)

`HORMONE_BUFFER.ts` remains observational. `GENETIC_LEDGER.ts` is now partially
live through two runtime controllers:

- `pulse.homeostasis.baseTax` in `GENETIC_LEDGER_RUNTIME.ts`
- `pulse.pressureRing.scale` in
  [PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts](/Users/s0fractal/OMEGA/PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts)

Durable replay now lives in two persistence lanes:

- [GENETIC_LEDGER_PERSISTENCE.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER_PERSISTENCE.ts)
- [PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts](/Users/s0fractal/OMEGA/PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts)

Both persistence lanes now include snapshot compaction, so hydration runs
through `snapshot + tail log` instead of replaying an unbounded event stream.

Executable guards:

- [test_hormone_buffer_contract.ts](/Users/s0fractal/OMEGA/test_hormone_buffer_contract.ts)
- [test_genetic_ledger_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_contract.ts)
- [test_genetic_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_runtime_contract.ts)
- [test_genetic_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_persistence_contract.ts)
- [test_genetic_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_compaction_contract.ts)
- [test_pressure_ring_scale_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_pressure_ring_scale_ledger_runtime_contract.ts)
- [test_pressure_ring_scale_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_pressure_ring_scale_ledger_persistence_contract.ts)
- [test_pressure_ring_scale_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_pressure_ring_scale_ledger_compaction_contract.ts)
- [test_pressure_ring_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_pressure_ring_ledger_path_contract.ts)
- [test_hormone_ledger_alignment_contract.ts](/Users/s0fractal/OMEGA/test_hormone_ledger_alignment_contract.ts)
- [test_homeostasis_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_ledger_path_contract.ts)

## `HORMONE_BUFFER`

Current hormone ids:

1. `entropy_pressure`
2. `time_viscosity`
3. `aggression`
4. `replication_bias`
5. `repair_drive`
6. `mutation_friction`

Each hormone must expose:

- `id`
- `index`
- `domain`
- `min`
- `max`
- `defaultValue`
- `controlPlane`
- `sourcePath`
- `notes`

Current rule:

- hormone values are normalized bounded scalars
- defaults are derived from current runtime policy
- no hormone is yet authoritative over live mutation flow

## `GENETIC_LEDGER`

The ledger is the bounded registry for global knobs that can later be changed by:

- daemon governance
- bounded runtime homeostasis
- future rollback-aware physiology

Each entry must expose:

- `key`
- `defaultValue`
- `min`
- `max`
- `mutability`
- `hormoneLink`
- `rollbackClass`
- `sourcePath`
- `notes`

Current initial ledger surface includes:

- pulse homeostasis knobs
- pressure-ring scale
- daemon ingress budgets
- federation degrade ratios

## Design law

Do not put everything in the ledger.

Only global numbers that actually alter world-level dynamics belong here.

This is not a bag of constants. It is the candidate constitutional layer for
physiology.

## Stage 7 gate

This stage becomes real only when:

1. live runtime knobs can be mapped to a hormone or a ledger entry
2. hard invariants remain outside the ledger
3. every ledger mutation has a rollback class
4. daemon controllers can be described as ledger/hormone updates instead of
   ad-hoc API pokes

## Current scope limit

At this point:

- there is no live `SharedArrayBuffer` hormone region yet
- there is now a durable event log for `pulse.homeostasis.baseTax` at
  `.omega/ledger/base_tax_ledger.jsonl`
- there is now a compacted snapshot for long-lived base-tax history at
  `.omega/ledger/base_tax_ledger.snapshot.json`
- there is now a durable event log for `pulse.pressureRing.scale` at
  `.omega/ledger/pressure_ring_scale_ledger.jsonl`
- there is now a compacted snapshot for long-lived pressure-ring scale history at
  `.omega/ledger/pressure_ring_scale_ledger.snapshot.json`
- there is still no general persistence layer for the rest of the ledger surface
- there is no runtime write path through `HORMONE_BUFFER`
- there is one established live ledger-owned write path:
  - `pulse.homeostasis.baseTax`
  - routed through `GENETIC_LEDGER_RUNTIME.ts`
  - persisted and replayed through `GENETIC_LEDGER_PERSISTENCE.ts`
  - exposed via `PULSE.applyGeneticLedgerUpdate(...)`
  - reverted via rollback token through `PULSE.rollbackGeneticLedgerUpdate(...)`
  - no longer writable through ad-hoc `PULSE.updateHomeostasisPolicy(...)`
- there is now a second live ledger-owned write path:
  - `pulse.pressureRing.scale`
  - routed through `PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts`
  - persisted and replayed through `PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts`
  - exposed via `PULSE.applyGeneticLedgerUpdate(...)`
  - reverted via rollback token through `PULSE.rollbackGeneticLedgerUpdate(...)`
  - no longer writable through ad-hoc `PULSE.updateEvolutionPressureRing(...)`

That is intentional. The contract is moving from zero runtime ownership to one
bounded ownership move, not to an open-ended configuration plane.

## Current status

As of 2026-03-06 this layer is:

- code-backed
- export-visible
- contract-tested
- observer-visible through `/api/physiology`
- partially authoritative over live runtime causality only for ledger-owned `baseTax`
- partially authoritative over live runtime causality for ledger-owned `baseTax`
  and `pressureRing.scale`
- durable enough that `baseTax` rollback tokens survive restart through replay
- compact enough that `baseTax` hydration can reload from snapshot + bounded tail
- durable enough that `pressureRing.scale` rollback tokens survive restart through replay
- compact enough that `pressureRing.scale` hydration can reload from snapshot + bounded tail
- observer-visible through `/api/homeostasis` and `/api/physiology` with
  `ledger_base_tax_persistence`
- observer-visible through `/api/pressure-ring` and `/api/physiology` with
  `ledger_scale_persistence` / `ledger_pressure_ring_scale_persistence`
