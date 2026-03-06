# Causal Atlas

> Planning placeholder. This file is intentionally incomplete until the migration work starts.

## Purpose

Map who currently owns causality in OMEGA-64 before any bridge to reduction-native execution is attempted.

## Required table schema

Each row should capture:

| Operation | Owner | Reads | Writes | Mutation Type | Determinism Risk | Future Target Layer | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Priority files

Initial atlas scope:

- `PULSE.ts`
- `PULSE_WORKER.ts`
- `assembly/index.ts`
- `OMEGA_DAEMON.ts`
- `AKASHA_SERVER.ts`
- `AKASHA_CODEX.ts`
- `GATE.ts`
- `STATE_MATRIX.ts`

## Mutation types

- `physics`
- `governance`
- `transport`
- `memory`
- `observer`
- `bootstrap`

## Minimum output requirement

Before implementation work begins, this file must contain:

- top-20 critical mutations
- owner classification
- determinism risk classification
- future disposition:
  - keep
  - wrap
  - move to ledger
  - move to reduction

## Initial worksheet

| Operation | Owner | Reads | Writes | Mutation Type | Determinism Risk | Future Target Layer | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `PULSE.tick()` host-lock maintenance | `PULSE.ts` | `STATE_MATRIX`, telemetry, queue state | `STATE_MATRIX`, telemetry stream | `physics` / `governance` | high | split between bridge + hormone layer | fill during Stage 1 |
| Worker-local WASM execution | `PULSE_WORKER.ts` + `assembly/index.ts` | shared substrate | shared substrate | `physics` | high | reduction bridge candidate | fill during Stage 1 |
| Daemon homeostasis / pressure feedback | `OMEGA_DAEMON.ts` | telemetry, codex, governance state | policy endpoints | `governance` | medium | hormone layer | fill during Stage 1 |
| Gate mutation admission | `GATE.ts` | proposals, snapshots, signatures | ledger artifacts | `governance` | high | ledger-preserved | fill during Stage 1 |

