# OMEGA-64 Reduction Metabolism Roadmap

> Status: planning artifact only. This document does not authorize runtime
> changes by itself.

## Purpose

This file is the strategic roadmap for moving OMEGA-64 from the current
opcode-governance runtime toward a bounded reduction-based metabolism.

It is intentionally split into two layers:

- **Myth layer**: why this migration exists and what kind of system it is trying
  to become.
- **Contract layer**: where the concrete migration checkpoints, artifacts, and
  gates live.

The detailed migration contract now lives under
[docs/migration/OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md).

Supporting planning artifacts:

- [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md)
- [docs/migration/GOLDEN_TRACES.md](/Users/s0fractal/OMEGA/docs/migration/GOLDEN_TRACES.md)
- [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md)
- [docs/migration/HORMONE_LEDGER_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/HORMONE_LEDGER_CONTRACT.md)

## Progress ledger

Status snapshot as of 2026-03-06:

| Phase                           | Status      | Notes                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkpoint 0                    | in progress | control surface frozen in planning docs; export now includes migration artifacts and persisted baseline traces                                                                                                                                                                                                             |
| Stage 1: causal atlas           | in progress | top-20 critical mutations owner-classified across the 8 key files                                                                                                                                                                                                                                                          |
| Stage 2: golden traces          | complete    | capture harness + observer telemetry surface added; persisted `gt01..gt06` baseline artifacts committed under `verification/traces/`                                                                                                                                                                                       |
| Stage 3: `GlyphIR64`            | in progress | registry, bridge mapping, and pretty/debug layer exist outside runtime closure                                                                                                                                                                                                                                             |
| Stage 4: shadow verification    | in progress | reduction shadow covers six bounded `gt01`/`gt03`/`gt05` cases, and admission shadow now covers `gt04`/`gt06` policy cases with persisted diff artifacts                                                                                                                                                                   |
| Stage 5                         | in progress | external pheromone/plasmid inject now seeds a shared `GLYPH_BUFFER`; host-lock advances decay/diffusion, telemetry exposes transport state, WASM trophism reads glyph gradients, internal emission leaks from `signalGrid` and `memoryGrid`, and a bounded subset of active atoms now emits glyph packets through role-shaped secretion policies |
| Stage 6                         | in progress | Codex now records `glyph_transport_regime` chronicles, preserves the latest transport regime in narrative/snapshot state, passes glyph evidence through the daemon-facing codex narrative contract, attaches glyph transport context to blocked/degraded daemon admission chronicles, feeds bounded glyph pressure into daemon admission scoring via read-only narrative context, records deferred daemon effect chronicles once queued actions are evaluated, and projects the latest daemon effect contour back into narrative/snapshot outputs |
| Stage 7: hormone / ledger layer | in progress | `baseTax`, `targetEnergy`, `pressureRing.scale`, `daemon.maxPheromoneIntensity`, and `daemon.maxPlasmidCharge` are now live ledger-owned knobs; all five survive restart and compact into `snapshot + tail` through dedicated persistence lanes, and Stage 7 now spans both pulse physiology and daemon ingress governance |
| Stage 8+                        | in progress | first slit is now live in bounded form: guardian pheromone emission supports `legacy-execute`, `shadow-reduce`, and `hybrid-reduce`, with fallback counters and observer telemetry while `shadow-reduce` remains the default rollout                                                                                                                                    |

Latest completed planning work:

- Added migration artifacts to the canonical export surface so external model
  audits can see both current runtime and declared direction of travel.
- Replaced the placeholder causal atlas with a first owner/risk/disposition
  table for the highest-impact mutations.
- Replaced the placeholder golden trace sheet with concrete scenarios, artifact
  paths, and drift-budget rules.
- Added a dedicated `GlyphIR64` contract document so the bridge vocabulary is
  visible before implementation starts.
- Added non-runtime bridge code for `GlyphIR64`, `opcode -> glyph` translation,
  and pretty/debug rendering without transferring any runtime ownership.
- Added a code-backed golden trace catalog so Stage 2 is no longer markdown-only
  planning.
- Added an observer-only mutation telemetry API surface so golden traces can
  capture mutation counters without touching causality.
- Added a persisted golden trace capture harness and committed six baseline
  trace artifact sets into `verification/traces/`.
- Added a bounded reduction verification harness with four initial
  parity-checked cases: seeded replicator loop, seeded architect loop, guardian
  stable branch, guardian repair branch.
- Extended the reduction harness with two policy-sensitive `gt05` anchor cases
  and persisted `verification/reduction_diffs/*.json` artifacts for all
  reduction cases.
- Extracted daemon ingress admission logic into `DAEMON_INGRESS_POLICY.ts` so
  runtime and verification now share one pure policy contract.
- Added an admission shadow harness for `gt04` and `gt06`, with committed
  `verification/admission_diffs/*.json` artifacts for low-risk plasmid
  acceptance, pheromone acceptance, and high-drift plasmid degradation.
- Extended the admission shadow lane with `gt07_daemon_policy_block`, so daemon
  ingress now has baseline evidence for accept, degrade, and hard policy block
  paths.
- Added a formal Stage 7 scaffold through `HORMONE_BUFFER.ts` and
  `GENETIC_LEDGER.ts`, plus contract guards that keep the physiological knob
  surface explicit before any live runtime integration.
- Added an observer-only physiology projection path: `PHYSIOLOGY_SNAPSHOT.ts`
  plus `/api/physiology` now expose Stage 7 state to runtime observers without
  granting write ownership to the hormone / ledger layer.
- Added the first live Stage 7 ownership move: `pulse.homeostasis.baseTax` now
  flows through `GENETIC_LEDGER_RUNTIME.ts`, emits rollback tokens, and is
  visible through homeostasis / physiology observer surfaces.
- Added durable replay for the first Stage 7 ownership move:
  `GENETIC_LEDGER_PERSISTENCE.ts` now persists `baseTax` ledger events and
  rehydrates them during `PULSE.initWorkers()`.
- Added snapshot compaction for the first Stage 7 ownership move: `baseTax`
  persistence now compacts durable history into `snapshot + bounded tail`, and
  observer surfaces expose `ledger_base_tax_persistence` so long-lived memory is
  externally visible.
- Tightened the first Stage 7 ownership move into a single canonical lane:
  `baseTax` no longer rides through the generic homeostasis overlay and now
  mutates only through the ledger-owned path.
- Added the second live homeostasis ownership move:
  `pulse.homeostasis.targetEnergy` now flows through a dedicated ledger
  runtime/persistence path, exposes rollback tokens, survives restart through
  replay, compacts into `snapshot + bounded tail`, and is no longer writable
  through the generic homeostasis overlay.
- Added the third live Stage 7 ownership move: `pulse.pressureRing.scale` now
  flows through a dedicated ledger runtime/persistence path, exposes rollback
  tokens, survives restart through replay, compacts into
  `snapshot + bounded tail`, and is no longer writable through the generic
  pressure-ring overlay.
- Added the fourth live Stage 7 ownership move: `daemon.maxPheromoneIntensity`
  now flows through a dedicated ledger runtime/persistence path, exposes
  rollback tokens, survives restart through replay, compacts into
  `snapshot + bounded tail`, and is no longer just a frozen ingress-policy
  constant inside the daemon membrane.
- Added the fifth live Stage 7 ownership move: `daemon.maxPlasmidCharge` now
  flows through a dedicated ledger runtime/persistence path, exposes rollback
  tokens, survives restart through replay, compacts into
  `snapshot + bounded tail`, and removes the last fixed plasmid budget from the
  daemon ingress membrane.
- Started Stage 5 internal transport: external pheromone/plasmid ingress now
  seeds a shared `GLYPH_BUFFER`, host-lock advances bounded decay/diffusion,
  telemetry exposes `glyph_transport`, and AssemblyScript trophism reads glyph
  gradients as a real local influence instead of a pure API-side event.
- Extended Stage 5 transport with the first two internal emission sources:
  `signalGrid` now leaks into pheromone glyph packets and `memoryGrid` now
  leaks into plasmid glyph packets, so transport is no longer membrane-only.
- Added the first agent-driven Stage 5 producer: a bounded subset of active
  atoms now emits pheromone/plasmid glyph packets directly during host lock,
  so internal transport no longer depends only on ingress or substrate leakage.
- Refined the first agent-driven producer into a role-shaped secretion policy:
  guardians bias toward pheromone emission, architects bias toward plasmid
  emission, producers can do both under tighter gates, parasites leak plasmids,
  and observer telemetry now exposes per-role emission counters.
- Started Stage 6 evidence bridging: `AKASHA_CODEX.ts` now records
  `glyph_transport_regime` chronicles from runtime transport snapshots, keeps a
  live glyph regime summary in codex state, and exposes that bridge through the
  daemon-facing narrative contract.
- Extended Stage 6 into daemon governance evidence: blocked/degraded admission
  chronicles now carry glyph transport context, so transport regimes are tied to
  specific ingress decisions instead of living only in narrative summaries.
- Extended Stage 6 one step further into bounded policy influence:
  `DAEMON_INGRESS_POLICY.ts` now reads glyph regime / dominant role from Codex
  narrative context and adds a capped pressure term to daemon admission
  scoring instead of reaching around the membrane for raw transport state.
- Extended Stage 6 into outcome evidence: `flushDaemonAuditEffects()` now
  forwards evaluated daemon-action deltas into `AKASHA_CODEX.recordDaemonEffect`,
  so the codex chain reaches beyond admission into observed runtime effect.
- Added Stage 6 outcome projection: Codex narrative/snapshot outputs now retain
  the latest daemon effect summary, lineage, and delta band, so observers and
  daemon reasoning can read effect contours without scraping raw chronicles.
- Started Stage 8 with a bounded live slit:
  `runtime_bridge/guardian_signal_hybrid.ts` now evaluates guardian scripts
  through the mapped glyph subset, `PULSE.ts` routes guardian pheromone
  emission through `legacy-execute` / `shadow-reduce` / `hybrid-reduce`, and
  observer telemetry now exposes `guardian_signal_hybrid` so the bridge can run
  live in shadow mode before it owns causality.

## Current diagnosis

OMEGA-64 already has:

- a shared substrate through `STATE_MATRIX.ts` + `OFFSETS.ts`
- an execution plane through workers + WASM
- a governance plane through `GATE.ts`
- a continuity plane through `AKASHA_CODEX.ts`, snapshots, chronicles, relics,
  and invariants
- an observer membrane through Akasha REST / WebSocket / WebRTC ingress

But it does **not** yet have a unified metabolic physics. Causality is still
distributed across:

- host orchestration
- daemon feedback
- gate policy
- imperative opcode execution
- ingress/control surfaces

The project is therefore not "pre-architecture". It is a hybrid runtime standing
between:

- **opcode-governance runtime**
- **reduction-native substrate**

## Strategic thesis

The migration target is not "less imperative code".

The target is:

> **Move causality from host-managed opcode/governance execution into a bounded
> reduction metabolism where glyph transport, hormonal feedback, codex memory,
> and semantic evolution become layers of one physics.**

That means:

- no big-bang rewrite
- no immediate deletion of the legacy ISA
- no early semantic mutation of the whole glyph space
- no runtime ownership ambiguity during the bridge phase

## Migration laws

1. The new reduction layer must first **observe**, then **replay**, then
   **shadow**, and only then **own** causality.
2. Legacy ISA stays alive until the bridge proves deterministic equivalence on
   selected scenarios.
3. `S/K/I/Y` remain hard invariants and are never placed into open semantic
   mutation.
4. Codex must evolve from narrative memory into evidence memory before semantic
   mutation is trusted.
5. Daemon control must act through bounded physiological knobs, not through
   arbitrary world rewriting.

## Phase map

The detailed plan is maintained in
[docs/migration/OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md).
The high-level order is:

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
2. Keep widening shadow coverage only where a golden trace exposes real
   causality, even if that means using a non-reduction shadow lane first.
3. Extend `GlyphIR64` mapping coverage only where a concrete trace id truly
   requires bridge-side control flow.
4. Keep new bridge and trace artifacts inside export so external audits critique
   the real migration edge.
5. Keep extending Stage 7 only through rollback-tokenized ledger ownership, and
   prefer daemon-governance knobs over new pulse-only knobs until cross-layer
   ownership is no longer exceptional.

Immediate execution edge:

1. Keep `gt04`/`gt06` in the new admission shadow lane until a real
   reduction-side control-flow contract exists for them.
2. Decide whether to widen the bridge subset with a compare/range primitive or
   keep the current exact-anchor model explicit.
3. Keep using the trace artifacts as rollback anchors for every bridge
   experiment.

Known bridge limit surfaced by Stage 4:

- The current bridge subset only supports `Imm8` anchors via `OP_SET`, so
  `gt05 target_energy=300` cannot yet be encoded directly in a shadow case.
- The current `gt05` reduction cases therefore use the representable policy
  anchor `band=240` instead of pretending full target-energy semantics already
  exist.
- `gt04` and `gt06` now have honest shadow coverage, but that coverage lives in
  the daemon-admission policy lane rather than the reduction bridge. This is
  intentional until `GlyphIR64` gains a mature control-flow contract.
- Stage 7 now has an executable contract and five authoritative runtime ledger
  write paths (`baseTax`, `targetEnergy`, `pressureRing.scale`,
  `daemon.maxPheromoneIntensity`, `daemon.maxPlasmidCharge`), but there is still
  no live `SharedArrayBuffer` hormone region and no broad ledger ownership over
  the rest of the knob surface. This is intentional.

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
