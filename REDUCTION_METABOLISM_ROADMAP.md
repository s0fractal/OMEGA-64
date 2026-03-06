# OMEGA-64 Reduction Metabolism Roadmap

> Status: planning artifact only. This document does not authorize runtime changes by itself.

## Purpose

This file is the strategic roadmap for moving OMEGA-64 from the current opcode-governance runtime toward a bounded reduction-based metabolism.

It is intentionally split into two layers:

- **Myth layer**: why this migration exists and what kind of system it is trying to become.
- **Contract layer**: where the concrete migration checkpoints, artifacts, and gates live.

The detailed migration contract now lives under [docs/migration/OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md).

Supporting planning artifacts:

- [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md)
- [docs/migration/GOLDEN_TRACES.md](/Users/s0fractal/OMEGA/docs/migration/GOLDEN_TRACES.md)
- [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md)

## Progress ledger

Status snapshot as of 2026-03-06:

| Phase | Status | Notes |
| --- | --- | --- |
| Checkpoint 0 | in progress | control surface frozen in planning docs; export now includes migration artifacts and persisted baseline traces |
| Stage 1: causal atlas | in progress | top-20 critical mutations owner-classified across the 8 key files |
| Stage 2: golden traces | complete | capture harness + observer telemetry surface added; persisted `gt01..gt06` baseline artifacts committed under `verification/traces/` |
| Stage 3: `GlyphIR64` | in progress | registry, bridge mapping, and pretty/debug layer exist outside runtime closure |
| Stage 4: reduction harness | in progress | `verification/reduction_harness.ts` + `verification/reduction_cases.ts` now shadow four bounded cases against `gt01`/`gt03` anchors with parity guards |
| Stage 5+ | not started | next gate is widening shadow coverage before any runtime ownership move |

Latest completed planning work:

- Added migration artifacts to the canonical export surface so external model audits can see both current runtime and declared direction of travel.
- Replaced the placeholder causal atlas with a first owner/risk/disposition table for the highest-impact mutations.
- Replaced the placeholder golden trace sheet with concrete scenarios, artifact paths, and drift-budget rules.
- Added a dedicated `GlyphIR64` contract document so the bridge vocabulary is visible before implementation starts.
- Added non-runtime bridge code for `GlyphIR64`, `opcode -> glyph` translation, and pretty/debug rendering without transferring any runtime ownership.
- Added a code-backed golden trace catalog so Stage 2 is no longer markdown-only planning.
- Added an observer-only mutation telemetry API surface so golden traces can capture mutation counters without touching causality.
- Added a persisted golden trace capture harness and committed six baseline trace artifact sets into `verification/traces/`.
- Added a bounded reduction verification harness with four initial parity-checked cases: seeded replicator loop, seeded architect loop, guardian stable branch, guardian repair branch.

## Current diagnosis

OMEGA-64 already has:

- a shared substrate through `STATE_MATRIX.ts` + `OFFSETS.ts`
- an execution plane through workers + WASM
- a governance plane through `GATE.ts`
- a continuity plane through `AKASHA_CODEX.ts`, snapshots, chronicles, relics, and invariants
- an observer membrane through Akasha REST / WebSocket / WebRTC ingress

But it does **not** yet have a unified metabolic physics. Causality is still distributed across:

- host orchestration
- daemon feedback
- gate policy
- imperative opcode execution
- ingress/control surfaces

The project is therefore not "pre-architecture". It is a hybrid runtime standing between:

- **opcode-governance runtime**
- **reduction-native substrate**

## Strategic thesis

The migration target is not "less imperative code".

The target is:

> **Move causality from host-managed opcode/governance execution into a bounded reduction metabolism where glyph transport, hormonal feedback, codex memory, and semantic evolution become layers of one physics.**

That means:

- no big-bang rewrite
- no immediate deletion of the legacy ISA
- no early semantic mutation of the whole glyph space
- no runtime ownership ambiguity during the bridge phase

## Migration laws

1. The new reduction layer must first **observe**, then **replay**, then **shadow**, and only then **own** causality.
2. Legacy ISA stays alive until the bridge proves deterministic equivalence on selected scenarios.
3. `S/K/I/Y` remain hard invariants and are never placed into open semantic mutation.
4. Codex must evolve from narrative memory into evidence memory before semantic mutation is trusted.
5. Daemon control must act through bounded physiological knobs, not through arbitrary world rewriting.

## Phase map

The detailed plan is maintained in [docs/migration/OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md). The high-level order is:

1. Checkpoint 0: freeze the current world as a control specimen
2. Stage 1: causal atlas
3. Stage 2: golden traces and verification harness
4. Stage 3: `GlyphIR64`
5. Stage 4: reduction harness outside production
6. Stage 5: internal glyph transport
7. Stage 6: Codex as evidence engine
8. Stage 7: formal homeostasis / hormone / ledger layer
9. Stage 8: first hybrid production path
10. Stage 9: semantic mutation sandbox
11. Stage 10: Doll Fork / shadow ecology

## Immediate priorities

The next practical priorities are:

1. Build the causal atlas for the key runtime roots and closure files.
2. Widen reduction shadow coverage from `gt01`/`gt03` into one mutation-sensitive anchor (`gt04` or `gt05`).
3. Extend `GlyphIR64` mapping coverage only where a concrete trace id needs it.
4. Keep new bridge and trace artifacts inside export so external audits critique the real migration edge.

Immediate execution edge:

1. Add trace-diff summaries so reduction harness outputs can be compared to baseline anchors as structured artifacts, not only console parity.
2. Introduce one mutation-adjacent shadow case using `gt04` or one homeostasis-adjacent case using `gt05`.
3. Keep using the trace artifacts as rollback anchors for every bridge experiment.

## Explicit deferrals

The following are intentionally deferred until the bridge is mature:

- assigning all 60 non-core glyphs fixed "protein" semantics
- open semantic mutation in production
- deletion of the legacy opcode path
- using Doll Fork as a direct learning source for mainline runtime

## Success criteria

The migration is considered real only when:

- critical mutations are owner-classified
- golden traces exist and are rerunnable
- at least one real life cycle can run through bounded reduction
- global dynamic knobs are formalized through hormone/ledger layers
- semantic mutation is sandboxed and rollbackable
- long-run stability survives the bridge without emergency host patching
