# OMEGA Transition Plan

> Contract document. This file describes migration sequencing, not
> implementation approval.

## Principle of transition

Do not perform a big-bang rewrite.

Use a dual system where the new reduction-native layer first:

1. observes
2. reproduces
3. cross-checks
4. only then takes over causality

This matters because the current system already has:

- a canonical governance lane through `GATE`
- internal fast mutation lanes
- external ingress that must not mutate `STATE_MATRIX` directly
- queue and telemetry mechanisms for mutation flow

## Progress status

Adjacent future-vector artifacts:

- [docs/migration/ROADMAP_2_SIGMA_CORE.md](/Users/s0fractal/OMEGA/docs/migration/ROADMAP_2_SIGMA_CORE.md)

Status snapshot as of 2026-03-06:

| Workstream                     | Status      | Deliverable                                                                                                                                                                                                                                                                                                                             |
| ------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkpoint 0 planning surface  | in progress | this file + causal atlas + golden traces + export inclusion + persisted baseline artifacts                                                                                                                                                                                                                                              |
| Stage 1 owner classification   | in progress | [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md) now contains the first critical-mutation table                                                                                                                                                                                                  |
| Stage 2 baseline definition    | complete    | markdown contract + code-backed catalog + observer capture harness + committed `verification/traces/gt01..gt12/*` baseline artifacts                                                                                                                                                                                                    |
| Stage 3 IR contract            | in progress | [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md) is now backed by non-runtime bridge code, including bounded `JZ`, `COLLECTIVE`, and `SHARE` coverage for symbolic/transport semantics                                                                                                                        |
| Stage 4 shadow verification    | in progress | reduction shadow covers `gt01`/`gt03`/`gt04`/`gt05`/`gt08`/`gt09`/`gt10`/`gt11`/`gt12`, while [admission_shadow_harness.ts](/Users/s0fractal/OMEGA/verification/admission_shadow_harness.ts) covers `gt04`/`gt06`/`gt07` daemon-policy cases with persisted diff artifacts                                                        |
| Stage 5 internal transport     | in progress | external pheromone/plasmid inject now seeds a shared `GLYPH_BUFFER`; host-lock advances bounded transport decay/diffusion, telemetry exposes `glyph_transport`, `assembly/index.ts` now reads glyph gradients inside `calculateTrophism(...)`, internal emission leaks from `signalGrid` and `memoryGrid`, and a bounded subset of active atoms now emits glyph packets through role-shaped secretion policies |
| Stage 6 codex evidence bridge  | in progress | `AKASHA_CODEX.ts` now records `glyph_transport_regime` chronicles from runtime transport snapshots, maintains live glyph regime state inside narrative/snapshot outputs, forwards that evidence through the daemon-facing codex narrative contract, attaches glyph transport context to blocked/degraded daemon admission chronicles, feeds bounded glyph pressure into daemon admission scoring via read-only narrative context, records deferred daemon effect chronicles once queued actions are evaluated, and projects the latest daemon effect contour back into narrative/snapshot outputs |
| Stage 7 physiological contract | in progress | `pulse.homeostasis.baseTax`, `pulse.homeostasis.targetEnergy`, `pulse.pressureRing.scale`, `daemon.maxPheromoneIntensity`, and `daemon.maxPlasmidCharge` are now ledger-owned, rollback-tokenized, replayable, and compacted through dedicated runtime/persistence lanes, while the rest of the layer remains bounded and observational |
| Stage 8 first slit             | in progress | guardian pheromone emission now supports `legacy-execute`, `shadow-reduce`, and `hybrid-reduce` through `runtime_bridge/guardian_signal_hybrid.ts`, with runtime fallback counters and observer telemetry while `shadow-reduce` remains the default rollout |

Current rule:

- no runtime causality moves to reduction until the corresponding golden trace
  exists and has a stated rollback path
- observer-only telemetry surfaces may expand if needed to make the traces
  measurable without mutating causality

## Checkpoint 0: break nothing

### Goal

Freeze the current world as a control specimen.

### Required planning artifacts

- [docs/migration/OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md)
- [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md)
- [docs/migration/GOLDEN_TRACES.md](/Users/s0fractal/OMEGA/docs/migration/GOLDEN_TRACES.md)

### Runtime roots to freeze as causal surface

- `AKASHA_SERVER.ts`
- `assembly/index.ts`
- `OMEGA_DAEMON.ts`
- `PULSE_WORKER.ts`
- `PULSE.ts`
- `SYSTEM_START.ts`

### Runtime closure focus

The migration zone includes at least:

- `GATE.ts`
- `STATE_MATRIX.ts`
- `AKASHA_CODEX.ts`
- `PHYSICS_ENGINE.ts`
- `MUTATION_TELEMETRY.ts`
- `STATE_SNAPSHOT.ts`
- `TELEMETRY_STREAM.ts`

### Experimental source layer

The main reduction candidates are:

- `LAMBDA_VM.ts`
- `RIBOSOME_TICK.ts`
- `ECOLOGY_ENGINE.ts`
- `REFLECTION_ENGINE.ts`
- `MATRIX_ENGINE.ts`

### Exit gate

- the causal surface is explicitly listed
- 3-5 golden scenarios are defined before runtime bridge work begins

## Stage 1: Causal Atlas

### Goal

Map who actually governs the world.

### Required file format

For each important node record:

- `owner`
- `reads`
- `writes`
- `mutation_type`
- `determinism_risk`
- `future_target_layer`

### Minimum files to classify

- `PULSE.ts`
- `PULSE_WORKER.ts`
- `assembly/index.ts`
- `OMEGA_DAEMON.ts`
- `AKASHA_SERVER.ts`
- `AKASHA_CODEX.ts`
- `GATE.ts`
- `STATE_MATRIX.ts`

### Mutation categories

- `physics`
- `governance`
- `transport`
- `memory`
- `observer`
- `bootstrap`

### Exit gate

- top-20 highest-risk mutations identified
- each critical mutation tagged as:
  - keep
  - wrap
  - move to ledger
  - move to reduction

## Stage 2: Golden Traces and verification harness

### Goal

Make the bridge measurable.

### Minimum scenarios

1. coldstart / seeded swarm
2. several thousand ticks without external intervention
3. pheromone inject
4. plasmid inject
5. homeostasis correction
6. daemon admission / rejection case

### Existing support signals

Current support files already suggest the trace direction:

- `worker_determinism_capture.ts`
- `worker_resilience_capture.ts`
- `worker_seeded_swarm.ts`
- `worker_trend_baseline.ts`
- `worker_trend_math.ts`

### What to capture

- tick count
- population
- avgEnergy
- spatial overflow
- mutation counts
- decree shifts
- codex snapshot digest
- invariant digest

### Exit gate

- before/after drift is measurable for each golden scenario
- baseline traces exist before any causal ownership migration

### Current stage assessment

- baseline scenarios are now committed under `verification/traces/`
- `verification/golden_trace_capture.ts` provides the reproducible observer
  harness
- `verification/golden_trace_catalog.ts` and
  `verification/golden_trace_capture.ts` now pass `deno check`, so the baseline
  layer is type-clean as well as artifact-backed
- Stage 2 now also supports standalone subprocess captures, so a causal motif
  that currently lives in a strict deterministic test harness can still become
  a first-class golden trace without inventing a fake REST ingress path
- Stage 2 now covers two standalone causal motifs outside the REST server:
  same-tick structure-intent visibility (`gt08`) and bounded collective hive /
  pheromone transport (`gt09`)
- Stage 2 now also covers bounded local share-transfer semantics (`gt10`), so
  direct bonded energy exchange has a committed control specimen before wider
  metabolic bridge work
- Stage 2 now also covers bounded collective banking semantics (`gt11`), so
  direct `OP_COLLECTIVE` mode `3/4` deposit-withdraw behavior has a committed
  control specimen before wider hive-economy bridge work
- Stage 2 now also covers bounded collective synchrony semantics (`gt12`), so
  direct `OP_COLLECTIVE` mode `5/6` phase-lock and quorum sync behavior has a
  committed control specimen before wider coordination bridge work
- `verification/reduction_harness.ts` now covers the bridge-safe opcode subset
- `verification/admission_shadow_harness.ts` now covers daemon
  mutation/admission semantics, including explicit policy-block baselines,
  without pretending they already belong to the reduction bridge
- next implementation step is no longer generic baseline-definition prose; it
  is either widening bridge semantics where a real trace demands it or moving a
  verified subset into a stricter hybrid path
- Stage 7 observer surfaces now expose `ledger_base_tax_persistence`, so
  persistence/compaction state is visible alongside the first live ledger-owned
  knob
- `baseTax` now has one canonical mutation lane:
  `PULSE.updateHomeostasisPolicy(...)` no longer accepts it, so runtime overlay
  and ledger ownership are no longer mixed for the same knob
- `targetEnergy` now has one canonical mutation lane:
  `PULSE.updateHomeostasisPolicy(...)` no longer accepts it either, so the live
  homeostasis contour is now ledger-owned instead of split between overlay and
  constitutional state
- `pressureRing.scale` now has one canonical mutation lane:
  `PULSE.updateEvolutionPressureRing(...)` no longer accepts it, so phase
  controls and ledger-owned amplitude no longer compete for the same causal slot
- `daemon.maxPheromoneIntensity` now has one canonical mutation lane:
  `/api/daemon-policy` routes through a dedicated ledger runtime/persistence
  pair, so daemon ingress economics no longer depend on a frozen in-memory
  constant or an ad-hoc policy poke
- `daemon.maxPlasmidCharge` now has one canonical mutation lane:
  `/api/daemon-policy` routes plasmid-budget updates through a dedicated ledger
  runtime/persistence pair, so daemon plasmid economics no longer depend on a
  startup-time constant

## Stage 3: Introduce `GlyphIR64`

### Goal

Build a true bridge between legacy ISA and reduction execution.

### Planned files

- `reduction_core/GlyphIR64.ts`
- `runtime_bridge/opcode_to_glyph.ts`
- `runtime_bridge/glyph_pretty.ts`
- contract first:
  [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md)

### Minimum structure

Each glyph entry should expose:

- `id: 0..63`
- `kind`
- `arity`
- `energyCost`
- `stabilityClass`
- `reductionRuleRef`
- `legacyOpcode?`

### Rules

- `0..3 = S/K/I/Y`
- the remaining glyph space starts as classes, not final protein semantics

### Suggested class groups

- structural
- catalytic
- transport
- regulatory
- memory
- reserve/noise

### Exit gate

- first 10-15 common legacy opcodes mapped into `GlyphIR64`
- readable forward and reverse debug views exist

## Stage 4: Reduction harness outside production

### Goal

Turn `RIBOSOME_TICK` and `LAMBDA_VM` into a verification engine, not production
causality.

### Planned files

- `verification/reduction_harness.ts`
- `verification/reduction_cases.ts`

### Harness responsibility

Run:

- the legacy script
- its `GlyphIR64` representation
- bounded reduction
- effect comparison

### First target scope

Only low-width behavior first:

- `signal`
- `replicate`
- `role`
- simple conditional/jump patterns
- simple local interactions

### Exit gate

- at least one complete atom life cycle is reproducible through the reduction
  harness
- mismatches are logged and explained, not hand-waved

### Current stage assessment

- `verification/reduction_cases.ts` now provides eighteen bounded bridge cases
- `verification/reduction_harness.ts` runs parity between legacy shadow
  execution and glyph-reduction shadow execution
- `verification/reduction_diffs/*.json` now persists structured diff artifacts
  for every covered case
- current covered motifs:
  - seeded replicator loop
  - seeded architect loop
  - guardian stable branch
  - guardian repair branch
  - plasmid property-write signal branch
  - plasmid zero-branch repair path
  - structure-intent same-tick visible branch
  - structure-intent typed miss branch
  - collective hive store/load branch
  - collective local pheromone emission branch
  - share bonded transfer success branch
  - share empty-bond fail-closed branch
  - collective bank deposit branch
  - collective capped withdraw branch
  - collective bonded phase-lock branch
  - collective local quorum sync branch
  - homeostasis-band anchor match
  - homeostasis-band anchor mismatch
- `verification/reduction_harness.ts` now tracks final prop-state parity, so
  bridge cases that depend on `PUT` validate actual symbolic writes instead of
  only register/control-flow parity
- `verification/reduction_harness.ts` now also models a bounded structure-intent
  overlay for `OP_BUILD` + `OP_SENSE`, so structural visibility can be verified
  against `gt08_structure_intent_visibility` without pretending it already rides
  through a membrane/API trace
- `verification/reduction_harness.ts` now also models bounded `OP_COLLECTIVE`
  mode 0/1/2 semantics, so hive store/load and local pheromone emission can be
  verified against `gt09_collective_transport` before any broader collective
  runtime hybridization
- `verification/reduction_harness.ts` now also models bounded `OP_SHARE`
  semantics, so bonded percentage transfer and empty-slot fail-closed behavior
  can be verified against `gt10_share_transfer` before broader metabolic or
  symbiotic bridge work
- `verification/reduction_harness.ts` now also models bounded `OP_COLLECTIVE`
  mode `3/4` semantics, so deposit and capped withdraw behavior can be verified
  against `gt11_collective_banking` before broader hive-economy or collective
  runtime hybridization
- `verification/reduction_harness.ts` now also models bounded `OP_COLLECTIVE`
  mode `5/6` semantics, so bonded phase-lock and local quorum sync can be
  verified against `gt12_collective_synchrony` before broader coordination or
  collective runtime hybridization
- `verification/reduction_harness.ts` now also models stale-lock `OP_SENSE`
  visibility against seeded structure overlays, so forward progress through
  stale structure locks can be verified against
  `gt13_structure_lock_progress` before deeper structure-lock bridge work
- known bridge limit:
  - the current bridge subset only has `Imm8` policy anchors, so
    `gt05 target_energy=300` cannot yet be encoded directly
  - current `gt05` cases therefore use the representable `band=240` anchor
    rather than claiming full homeostasis semantics
- mutation-sensitive admission coverage now lives in
  `verification/admission_shadow_harness.ts`, anchored to `gt04_plasmid_inject`,
  `gt06_daemon_admission_case`, and `gt07_daemon_policy_block`
- next gate is no longer "cover `gt04` somehow"; it is deciding whether a real
  compare/range primitive belongs in the bridge, or whether those policy-first
  cases should remain outside reduction for now

## Stage 5: Transport becomes internal

### Goal

Move glyph transport from membrane-only behavior into world physics.

### Current baseline

`AKASHA_SERVER.ts` already normalizes and proxies:

- `DROP_PHEROMONE`
- `INJECT_PLASMID`
- `/api/inject`
- `/api/homeostasis`
- `/api/pressure-ring`

This is a good membrane, but not yet an internal circulatory system.

### Current stage assessment

- `OFFSETS.ts` and `STATE_MATRIX.ts` now reserve and expose a shared
  `GLYPH_BUFFER` as `glyphHeaders + glyphPayload`.
- `AVATAR_ENGINE.ts` and `CONTROL_INTENT_QUEUE.ts` now seed that substrate from
  existing pheromone / plasmid ingress without breaking the current membrane.
- `PULSE.ts` now advances bounded glyph decay/diffusion during host lock.
- `SYSTEM_START.ts` now exposes `glyph_transport` through observer surfaces.
- `assembly/index.ts` now reads glyph gradients inside `calculateTrophism(...)`,
  so the transport field has a real local behavioral effect in the WASM plane.
- `GLYPH_BUFFER.ts` now leaks `signalGrid` into pheromone glyph packets and
  `memoryGrid` into plasmid glyph packets, so Stage 5 has two internal emission
  sources that do not depend on REST ingress.
- `PULSE.ts` now lets a bounded subset of active atoms emit pheromone and
  plasmid glyph packets directly during host lock, so Stage 5 now has a first
  agent-driven internal producer instead of only membrane ingress or substrate
  leakage.
- that agent-driven producer is now role-shaped: guardians bias toward
  pheromone emission, architects bias toward plasmid emission, producers can do
  both under tighter gates, parasites leak plasmids, and observer surfaces can
  inspect the per-role emission counters.
- broad wasm-native secretion is still deferred; Stage 5 is now real, but not
  yet complete.

### Planned substrate additions

- `GLYPH_BUFFER` compatible with `STATE_MATRIX`
- local `glyph packet` structures
- per-glyph transport attributes:
  - `half_life`
  - `diffusion_radius`
  - `decay_profile`

### Transition order

1. external inject still works
2. injected glyph enters the internal buffer
3. local nodes read glyph influence from buffer
4. internal auto-emission is added later

### Exit gate

- at least two internal glyph emission sources exist without REST
- at least one local behavior depends on glyph buffer state

## Stage 6: Codex becomes evidence engine

### Goal

Protect the strongest existing layer by upgrading it, not bypassing it.

### Current strengths

`AKASHA_CODEX.ts` already tracks:

- species
- chronicles
- relics
- daemon invariants
- snapshots / narratives / lineage profiles
- extinction, decree shifts, market outcomes, daemon admission

### New entities to introduce

- `reduction_trace_digest`
- `glyph_lineage`
- `semantic_mutation_proposal`
- `rollback_candidate`
- `invariant_drift_budget`

### New Codex responsibility

Codex should answer:

- what changed
- why the change was admissible
- whether the drift was semantic or ecological

### Current stage assessment

- `AKASHA_CODEX.observePulse(...)` now receives runtime glyph transport
  snapshots from `PULSE.ts`, not just population counts.
- Codex now classifies the transport field into a `glyph_transport_regime`
  evidence signal and records regime changes as chronicles instead of leaving
  transport trapped in raw telemetry.
- Codex narrative/snapshot outputs now retain live glyph status, dominant role,
  and source mode, so daemon-side reasoning can see transport ecology without
  scraping raw runtime telemetry.
- Blocked/degraded daemon admission chronicles now retain glyph transport
  context, so transport regime and ingress policy pressure can be audited in the
  same codex evidence chain.
- Glyph regime / dominant-role evidence now also contributes a bounded pressure
  term inside `evaluateInvariantAdmission(...)`, but only through normalized
  codex narrative context rather than raw runtime transport state.
- Deferred daemon effect evaluation now also lands in Codex as
  `daemon_effect` chronicles, so the evidence chain can extend from
  ingress decision to observed runtime delta.
- Codex narrative/snapshot outputs now also retain a compact `daemonEffect`
  contour, so observer tooling and daemon reasoning can consume the latest
  outcome signal without scraping raw chronicle history.
- This is still a bridge, not a full Codex upgrade: transport evidence now
  reaches daemon admission scoring and post-admission effect chronicles, but it
  still does not drive rollback policy or mutation pricing on its own.

### Exit gate

- every serious mutation/admission event has a codex evidence trail
- chain exists:
  `mutation -> invariant response -> daemon decision -> lineage effect`

## Stage 7: Formal homeostasis layer

### Goal

Move daemon tuning into a canonical physiological layer.

### Planned artifacts

- `HORMONE_BUFFER`
- `GENETIC_LEDGER`
- `HOMEOSTASIS_POLICY.md`

### Minimum hormone fields

- `entropy_pressure`
- `time_viscosity`
- `aggression`
- `replication_bias`
- `repair_drive`
- `mutation_friction`

### Genetic ledger requirements

For each global dynamic constant:

- current value
- min/max
- source
- last change tick
- reason
- rollback token

### Exit gate

- no globally meaningful dynamic number floats without owner and bounds
- daemon acts through physiological knobs, not direct world rewriting

### Current stage assessment

- `HORMONE_BUFFER.ts` now defines the initial six-hormone physiological catalog:
  - `entropy_pressure`
  - `time_viscosity`
  - `aggression`
  - `replication_bias`
  - `repair_drive`
  - `mutation_friction`
- `GENETIC_LEDGER.ts` now defines the initial bounded registry for homeostasis,
  pressure-ring, daemon ingress, and federation degrade knobs.
- [docs/migration/HORMONE_LEDGER_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/HORMONE_LEDGER_CONTRACT.md)
  is now the explicit Stage 7 contract artifact and is included in export.
- `PHYSIOLOGY_SNAPSHOT.ts` plus `GET /api/physiology` now provide an
  observer-only runtime projection of hormone / ledger state through
  `SYSTEM_START.ts` and `AKASHA_SERVER.ts`.
- `GENETIC_LEDGER_RUNTIME.ts` now owns the first live ledger mutation path for
  `pulse.homeostasis.baseTax`, including rollback-token semantics and
  observer-visible summary state.
- `GENETIC_LEDGER_PERSISTENCE.ts` now persists and replays `baseTax` ledger
  events, so rollback tokens survive restart and hydration happens during
  `PULSE.initWorkers()`.
- `HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts` now owns the second live homeostasis
  mutation path for `pulse.homeostasis.targetEnergy`, including rollback-token
  semantics and observer-visible summary state.
- `HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts` now persists and replays
  `targetEnergy` ledger events, so rollback tokens survive restart and hydration
  happens during `PULSE.initWorkers()`.
- `PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts` and
  `PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts` now own the third live ledger
  mutation path for `pulse.pressureRing.scale`, including rollback-token,
  replay, and compaction semantics.
- `DAEMON_PHEROMONE_LEDGER_RUNTIME.ts` and
  `DAEMON_PHEROMONE_LEDGER_PERSISTENCE.ts` now own the fourth live ledger
  mutation path for `daemon.maxPheromoneIntensity`, including rollback-token,
  replay, and compaction semantics through `SYSTEM_START.ts`,
  `AKASHA_SERVER.ts`, and `DAEMON_INGRESS_POLICY.ts`.
- `DAEMON_PLASMID_LEDGER_RUNTIME.ts` and `DAEMON_PLASMID_LEDGER_PERSISTENCE.ts`
  now own the fifth live ledger mutation path for `daemon.maxPlasmidCharge`,
  including rollback-token, replay, and compaction semantics through
  `SYSTEM_START.ts`, `AKASHA_SERVER.ts`, and `DAEMON_INGRESS_POLICY.ts`.
- contract guards now exist for:
  - [test_hormone_buffer_contract.ts](/Users/s0fractal/OMEGA/test_hormone_buffer_contract.ts)
  - [test_genetic_ledger_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_contract.ts)
  - [test_genetic_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_runtime_contract.ts)
  - [test_genetic_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_persistence_contract.ts)
  - [test_hormone_ledger_alignment_contract.ts](/Users/s0fractal/OMEGA/test_hormone_ledger_alignment_contract.ts)
  - [test_physiology_snapshot_contract.ts](/Users/s0fractal/OMEGA/test_physiology_snapshot_contract.ts)
  - [test_physiology_api_contract.ts](/Users/s0fractal/OMEGA/test_physiology_api_contract.ts)
  - [test_homeostasis_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_ledger_path_contract.ts)
  - [test_daemon_pheromone_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_runtime_contract.ts)
  - [test_daemon_pheromone_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_persistence_contract.ts)
  - [test_daemon_pheromone_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_compaction_contract.ts)
  - [test_daemon_pheromone_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_daemon_pheromone_ledger_path_contract.ts)
  - [test_daemon_plasmid_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_runtime_contract.ts)
  - [test_daemon_plasmid_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_persistence_contract.ts)
  - [test_daemon_plasmid_ledger_compaction_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_compaction_contract.ts)
  - [test_daemon_plasmid_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_daemon_plasmid_ledger_path_contract.ts)
- current scope remains deliberately narrow:
  - no live `SharedArrayBuffer` hormone region
  - only `pulse.homeostasis.baseTax`, `pulse.homeostasis.targetEnergy`,
    `pulse.pressureRing.scale`, `daemon.maxPheromoneIntensity`, and
    `daemon.maxPlasmidCharge` are ledger-owned in live runtime
  - only those five knobs currently have durable replay history
  - all other hormone / ledger knobs remain observational or scaffold-only
- next gate is deciding whether to widen daemon-governed ledger ownership beyond
  these two daemon budgets or to shift effort into Stage 5 internal glyph
  transport.

## Stage 8: First hybrid production path

### Goal

Give reduction a narrow, reversible opening into live runtime.

### Required runtime modes

- `legacy-execute`
- `hybrid-reduce`
- `shadow-reduce`

### First production slit

Choose exactly one behavior family:

- local signaling
- simple replication decision
- role-expression

No more than one at first.

Current slit in progress:

- guardian pheromone emission is now the chosen local-signaling slit
- `runtime_bridge/guardian_signal_hybrid.ts` evaluates the live guardian script
  through the mapped bridge subset using read-only neural coherence input
- `PULSE.ts` now supports:
  - `legacy-execute`
  - `shadow-reduce`
  - `hybrid-reduce`
- rollout is intentionally conservative:
  - `shadow-reduce` is the default mode
  - `hybrid-reduce` exists but only narrows guardian pheromone emission
  - any bridge failure falls back automatically to legacy emission
- observer surfaces now expose `guardian_signal_hybrid`, so the slit is visible
  in `/api/telemetry` and `/api/physiology` before broader runtime ownership is
  transferred
- `verification/guardian_signal_mode_harness.ts` now compares the slit across
  `legacy`, `shadow`, and `hybrid` modes and writes committed
  `verification/hybrid_mode_diffs/*.json` artifacts for stable, repair, and
  fallback cases before any default-mode promotion is considered
- `GUARDIAN_SIGNAL_PROMOTION.ts` now acts as the promotion gate contract:
  runtime telemetry, physiology, and long-run audit scripts all compute the
  same `shadow -> hybrid` recommendation from fallback ratio and branch
  coverage, but the default mode remains `shadow-reduce` until an explicit
  promotion decision is made
- `GUARDIAN_SIGNAL_PROMOTION_DECISION.ts` now turns that recommendation into an
  explicit `promote` / `hold` verdict inside long-run canary and daemon audit
  reports by combining guardian readiness with enclosing runtime health
- `GUARDIAN_SIGNAL_PROMOTION_ACTION.ts` now turns that verdict into a canonical
  `promote` / `hold` / `demote` action artifact so the Stage 8 slit can be
  reasoned about symmetrically before any default-mode switch is attempted
- `runtime_bridge/architect_plasmid_hybrid.ts` now introduces the second
  bounded hybrid slit: architect plasmid emission can be observed through
  `legacy`, `shadow`, and `hybrid` reduction modes without yet adding a second
  promotion stack around it
- `verification/architect_plasmid_mode_harness.ts` now anchors that second
  slit to `gt04_plasmid_inject`, so architect plasmid reduction runs produce
  committed emit/suppress/fallback artifacts before any broader rollout logic
  is considered

### Exit gate

- one real runtime path runs via bounded reduction
- automatic fallback to legacy exists on failure

## Stage 9: Semantic mutation sandbox

### Goal

Allow semantic change only under controlled shadow conditions.

### Planned artifacts

- `semantic_sandbox/`
- `mutation_proposals.json`
- `shadow_evolution_runner.ts`

### Hard rules

- `S/K/I/Y` are immutable
- reserve glyphs can be explored
- catalytic / regulatory classes can be reassigned only in sandbox
- all changes require:
  - proposal
  - shadow run
  - rollback

### Exit gate

- no semantic mutation reaches mainline without shadow validation
- drift budget violations trigger automatic rejection

## Stage 10: Doll Fork / Shadow Ecology

### Goal

Turn shadow runtime into a laboratory, not a leak path.

### Allowed functions

- reduction rehearsal
- relic cultivation
- glyph composition farming
- mutation simulation

### What can return to mainline

- verified relics
- stable glyph compositions
- approved semantic proposals

### Exit gate

- main runtime never learns directly from raw shadow output
- Doll Fork becomes a validation ecology, not a chaotic twin

## Practical work rhythm

### Sprint A

- causal atlas
- golden traces
- top-20 mutation list

Result: the spine is visible before any bridge code exists.

### Sprint B

- `GlyphIR64`
- opcode-to-glyph bridge
- first 10-15 mappings

Result: the new language exists without taking runtime ownership.

### Sprint C

- reduction harness
- parallel verification
- first bounded reduction case

Result: reduction becomes measurable instead of aspirational.

### Sprint D

- internal glyph buffer
- internal transport
- glyph-aware local behavior

Result: transport becomes physics.

### Sprint E

- `HORMONE_BUFFER`
- `GENETIC_LEDGER`
- daemon through formal knobs

Result: homeostasis stops being ad-hoc tuning.

### Sprint F

- one hybrid production path
- fallback
- trace diff

Result: the new substrate touches live runtime safely.

## Stop signals

Do not advance if:

- golden traces do not exist
- rollback path does not exist
- drift budget is undefined
- reduction and legacy diverge without explanation
- glyph semantics are used in runtime without ledger specification

## Documentation style

For every major stage, maintain two artifacts:

1. `MYTH.md` short, expressive, purpose-focused

2. `CONTRACT.md` strict:
   - inputs
   - outputs
   - invariants
   - fail modes
   - rollback

This keeps myth and engineering aligned without letting either erase the other.

## Immediate next 3 planning steps

1. Fill
   [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md)
   for the 8 key files.
2. Define the first golden scenarios in
   [docs/migration/GOLDEN_TRACES.md](/Users/s0fractal/OMEGA/docs/migration/GOLDEN_TRACES.md).
3. Draft the first `GlyphIR64` type contract before any bridge implementation
   begins.
