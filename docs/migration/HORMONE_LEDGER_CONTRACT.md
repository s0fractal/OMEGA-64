# Hormone / Ledger Contract

> Stage 7 contract scaffold. This document formalizes the physiological knobs before they are wired into live runtime ownership.

## Purpose

Stage 7 needs two explicit layers:

- `HORMONE_BUFFER`: the current global physiological field
- `GENETIC_LEDGER`: the bounded registry of mutable global constants

The point is not "more configuration". The point is to stop letting important
global knobs live as disconnected ad-hoc controller state.

## Current code-backed scaffold

The non-runtime support catalog now exists in:

- [HORMONE_BUFFER.ts](/Users/s0fractal/OMEGA/HORMONE_BUFFER.ts)
- [GENETIC_LEDGER.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER.ts)

These files are not yet imported by active runtime roots. They are migration
contracts with executable structure.

Executable guards:

- [test_hormone_buffer_contract.ts](/Users/s0fractal/OMEGA/test_hormone_buffer_contract.ts)
- [test_genetic_ledger_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_contract.ts)
- [test_hormone_ledger_alignment_contract.ts](/Users/s0fractal/OMEGA/test_hormone_ledger_alignment_contract.ts)

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
- there is no persistence layer for ledger history yet
- there is no runtime write path through `HORMONE_BUFFER` / `GENETIC_LEDGER`

That is intentional. This contract exists so the next step can wire these
concepts into runtime without inventing semantics on the fly.

## Current status

As of 2026-03-06 this layer is:

- code-backed
- export-visible
- contract-tested
- still non-authoritative over live runtime causality
