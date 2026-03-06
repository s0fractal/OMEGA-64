# Causal Atlas

> Stage 1 working draft. Owner classification started on 2026-03-06. This is a migration control document, not an implementation artifact.

## Purpose

Map who currently owns causality in OMEGA-64 before any bridge to reduction-native execution is attempted.

This file tracks the mutations that actually move the world, not every helper function in the repository.

## Scope

Stage 1 minimum atlas coverage:

- `PULSE.ts`
- `PULSE_WORKER.ts`
- `assembly/index.ts`
- `OMEGA_DAEMON.ts`
- `AKASHA_SERVER.ts`
- `AKASHA_CODEX.ts`
- `GATE.ts`
- `STATE_MATRIX.ts`

## Status

| Item | Status | Notes |
| --- | --- | --- |
| Owner classification | in progress | top-20 critical mutations mapped below |
| Determinism risk classification | in progress | low/medium/high/critical scale applied |
| Future disposition tagging | in progress | keep / wrap / move to ledger / move to reduction |
| Residual file notes | pending | lower-risk observer and helper surfaces still need secondary pass |

## Mutation types

- `physics`
- `governance`
- `transport`
- `memory`
- `observer`
- `bootstrap`

## Determinism risk scale

- `low`: observer-only or debug-only, no canonical state mutation
- `medium`: bounded policy or membrane mutation, canonical world changed only through validated API
- `high`: direct host-side or daemon-side state shaping with bounded scope
- `critical`: shared substrate mutation, cross-worker ordering sensitivity, or canonical ledger authority

## Top-20 critical mutations

| ID | Operation | File | Owner | Reads | Writes | Type | Risk | Disposition | Future target layer | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Worker boot policy, WASM preflight, init fallback | `PULSE.ts` | host bootstrap | runtime policy, wasm artifact health, worker status | worker pool state, boot mode flags, safe-noop/degraded mode | `bootstrap` | high | keep | runtime bootstrap lane | This decides whether the world gets a parallel kernel, a serial fallback, or a degraded safe-noop shell. |
| 2 | Startup self-test and forced single-worker fallback | `PULSE.ts` | host bootstrap | empty-world check, tick counter, sync state | worker topology, matrix clear, tick reset, sync wakeups | `bootstrap` | high | keep | runtime bootstrap lane | Cold-start only, but it mutates the substrate during diagnostic replay. |
| 3 | Bond-request resolution | `PULSE.ts` | host sequential physics shim | active atom set, bond request slots | bonds, stiffness, cleared request slots | `physics` | high | wrap | bridge-side sequential shim, later reduction | This is still imperative JS causality sitting above the substrate. |
| 4 | Spatial-hash rebuild, physics snapshot freeze, sync phase transitions | `PULSE.ts` | host scheduler | active atoms, current positions/energies, worker state | `syncState`, spatial hash state, read buffers | `physics` | critical | move to reduction | reduction substrate / bounded scheduling layer | This is one of the most important ownership boundaries in the current runtime. |
| 5 | Spawn-queue drain into `seedAtom()` | `PULSE.ts` | host scheduler | spawn ring, free slots, child genome payload | ids, positions, energy, logic, spawn cursors | `physics` | critical | wrap | glyph transport + reduction bridge | Currently reproduction is completed on the host after being requested in WASM. |
| 6 | Host-lock mutation drains from oracle and control queue | `PULSE.ts` | host governance lane | pending oracle mutations, `CONTROL_INTENT_QUEUE` | shared state through admitted mutation lanes, telemetry | `governance` | high | move to ledger | ledger-bound hormone / governance layer | This is already separated from the fast lane, but still concentrated in host-lock orchestration. |
| 7 | Evolution pressure adjustment | `PULSE.ts` | host physiology shim | active genomes, bond topology, phase-ring state | per-atom energy, mutation telemetry | `governance` | high | move to ledger | hormone layer | This is the first real example of policy changing local fitness without changing physics instructions. |
| 8 | Energy homeostasis tax/subsidy | `PULSE.ts` | host physiology shim | current energy, target energy, overflow ratio | per-atom energy, mutation telemetry | `governance` | high | move to ledger | hormone layer + genetic ledger | Dynamic enough to be physiological, but still implemented as host-side arithmetic over raw substrate arrays. |
| 9 | Periodic gate audit and coherence persistence | `PULSE.ts` | host governance lane | active atoms, resonance, gate schedule | gate-triggered recycling/role changes, coherence cell, codex pulse | `governance` | high | split | keep gate lane; move metrics to hormone/evidence layers | This currently bundles governance policing, coherence projection, and codex triggering in one host pass. |
| 10 | WASM instantiation and export binding | `PULSE_WORKER.ts` | worker bootstrap | release wasm, host memory handle, init payload | bound wasm exports, READY / INIT_FAILED state | `bootstrap` | high | keep | runtime bootstrap lane | Not canonical world mutation by itself, but it determines execution ownership. |
| 11 | Worker phase dispatch (`PULSE`, `REDUCE_DELTAS`, `TICK_MATRIX`, `BUILD_SPATIAL_HASH`) | `PULSE_WORKER.ts` | worker execution lane | sync state, shared substrate, worker ranges | shared substrate through wasm exports, per-phase completion signals | `physics` | critical | move to reduction | reduction execution lane | This is the active fast lane and must become the first reduction-native ownership surface later. |
| 12 | Legacy ISA execution loop (`execute_atom`) | `assembly/index.ts` | wasm kernel | instruction tape, registers, read snapshots, local lattice state | registers, PC, energy, resonance, position, bond data | `physics` | critical | move to reduction | reduction kernel | This is the concrete legacy behavior that `GlyphIR64` must first mirror, not replace blindly. |
| 13 | Replication publish into spawn ring | `assembly/index.ts` | wasm kernel | local energy/resonance, parent genome, lattice position | spawn request ring, parent energy/resonance | `physics` | critical | move to reduction | glyph transport / bounded reproduction lane | Crosses the main boundary between local execution and host-side birth materialization. |
| 14 | Charge / build intent publish (`OP_SIGNAL`, `OP_PLUG`, `OP_BUILD`) | `assembly/index.ts` | wasm kernel | structure grid, charge state, resonance, role | structure intent buffers, charge intent buffers, signal field | `physics` | critical | move to reduction | internal glyph / structure transport | These opcodes already behave more like physical field writes than like high-level commands. |
| 15 | Collective side-effects (`OP_COLLECTIVE`, `OP_SHARE`, `OP_ROLE`, `OP_TENSEGRITY`) | `assembly/index.ts` | wasm kernel | hive memory, bonded neighbors, role state, local energy | hive bank, energy deltas, role bytes, damping/bond distances, PC sync | `physics` | high | split | reduction kernel + memory/hormone layers | This is a mixed bag and will need decomposition before clean migration. |
| 16 | Phase-ring and homeostasis controllers | `OMEGA_DAEMON.ts` | daemon governance | telemetry, invariant frame, daemon governance snapshot | `/api/pressure-ring`, `/api/homeostasis` | `governance` | medium | move to ledger | hormone layer + genetic ledger | The daemon is already acting as an endocrine controller rather than a direct world mutator. |
| 17 | External injection dispatch | `OMEGA_DAEMON.ts` | daemon membrane | LLM decision payload, control token, inject endpoint state | `/api/inject` requests | `transport` | high | keep | proposal / membrane lane only | This must stay proposal-level, never direct shared-memory write access. |
| 18 | Membrane proxy forwarding (`/api/inject`, `/api/homeostasis`, `/api/pressure-ring`, telemetry/codex proxy, WebRTC inject`) | `AKASHA_SERVER.ts` | ingress membrane | external requests, control token, system API | forwarded REST calls, mesh envelopes | `transport` | medium | keep | membrane layer | This is legitimate causality, but only as a validated forwarding membrane. |
| 19 | Pulse observation and async codex persistence | `AKASHA_CODEX.ts` | continuity / evidence lane | population, epoch timing, state matrix samples, daemon invariant file | species/relic/invariant markdown, indexes, chronicles, codex state | `memory` | medium | keep | evidence engine | Not fast-path physics, but it already shapes future governance context and must be treated as durable memory, not just logging. |
| 20 | Canonical mutation admission + live runtime policing | `GATE.ts` | governance canon | proposals, snapshots, signatures, policy hash, current matrix state | ledger events, checkpoints, accepted deltas, recycled atoms, role quarantine | `governance` | critical | split | canonical ledger lane + bounded runtime audit lane | `mutate()` is canonical and ledger-bound; `auditMatrix()` is live runtime policing. They should stay conceptually separate. |

## File-level ownership notes

### `STATE_MATRIX.ts`

`STATE_MATRIX.ts` is not a policy owner, but it exposes the broadest mutation surface in the system.

Current assessment:

- `setId`, `setX`, `setY`, `setEnergy`, `setRole`, `setLogic`, `setInstructions`, `seedAtom`, and `clear` are all mutation-capable substrate APIs.
- Determinism risk is `critical` whenever these setters are called outside an explicitly owned lane.
- Future direction is not "remove setters", but "wrap writes so every call site belongs to a classified owner": reduction, ledger-governed mutation, hormone/homeostasis, or bootstrap.

### `AKASHA_SERVER.ts` observer side

`scanUniverse()` and websocket broadcasting are **observer-only** and intentionally outside the top-20 critical mutation set.

Important caveat:

- `Math.random()` is used while assigning fallback UI coordinates during markdown scans.
- That nondeterminism is acceptable only because it does not write canonical matrix state or ledger state.

## Immediate migration guidance

Do not move anything from the table above into reduction until:

1. the corresponding golden trace exists,
2. the rollback owner is explicit,
3. the replacement lane is narrower than the current one.
