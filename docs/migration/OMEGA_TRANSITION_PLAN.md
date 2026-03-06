# OMEGA Transition Plan

> Contract document. This file describes migration sequencing, not implementation approval.

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

Status snapshot as of 2026-03-06:

| Workstream | Status | Deliverable |
| --- | --- | --- |
| Checkpoint 0 planning surface | in progress | this file + causal atlas + golden traces + export inclusion + persisted baseline artifacts |
| Stage 1 owner classification | in progress | [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md) now contains the first critical-mutation table |
| Stage 2 baseline definition | complete | markdown contract + code-backed catalog + observer capture harness + committed `verification/traces/gt01..gt07/*` baseline artifacts |
| Stage 3 IR contract | in progress | [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md) is now backed by non-runtime bridge code |
| Stage 4 shadow verification | in progress | reduction shadow covers `gt01`/`gt03`/`gt05`, while [admission_shadow_harness.ts](/Users/s0fractal/OMEGA/verification/admission_shadow_harness.ts) covers `gt04`/`gt06`/`gt07` daemon-policy cases with persisted diff artifacts |
| Stage 7 physiological contract | in progress | `pulse.homeostasis.baseTax` is now ledger-owned, rollback-tokenized, and replayable through [GENETIC_LEDGER_RUNTIME.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER_RUNTIME.ts) + [GENETIC_LEDGER_PERSISTENCE.ts](/Users/s0fractal/OMEGA/GENETIC_LEDGER_PERSISTENCE.ts), while the rest of the layer remains bounded and observational |

Current rule:

- no runtime causality moves to reduction until the corresponding golden trace exists and has a stated rollback path
- observer-only telemetry surfaces may expand if needed to make the traces measurable without mutating causality

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
- `verification/golden_trace_capture.ts` provides the reproducible observer harness
- `verification/reduction_harness.ts` now covers the bridge-safe opcode subset
- `verification/admission_shadow_harness.ts` now covers daemon mutation/admission semantics, including explicit policy-block baselines, without pretending they already belong to the reduction bridge
- next implementation step is not more baseline-definition prose; it is either widening bridge control flow honestly or widening trace-tied shadow coverage

## Stage 3: Introduce `GlyphIR64`

### Goal

Build a true bridge between legacy ISA and reduction execution.

### Planned files

- `reduction_core/GlyphIR64.ts`
- `runtime_bridge/opcode_to_glyph.ts`
- `runtime_bridge/glyph_pretty.ts`
- contract first: [docs/migration/GLYPHIR64_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/GLYPHIR64_CONTRACT.md)

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

Turn `RIBOSOME_TICK` and `LAMBDA_VM` into a verification engine, not production causality.

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

- at least one complete atom life cycle is reproducible through the reduction harness
- mismatches are logged and explained, not hand-waved

### Current stage assessment

- `verification/reduction_cases.ts` now provides six bounded bridge cases
- `verification/reduction_harness.ts` runs parity between legacy shadow execution and glyph-reduction shadow execution
- `verification/reduction_diffs/*.json` now persists structured diff artifacts for every covered case
- current covered motifs:
  - seeded replicator loop
  - seeded architect loop
  - guardian stable branch
  - guardian repair branch
  - homeostasis-band anchor match
  - homeostasis-band anchor mismatch
- known bridge limit:
  - the current bridge subset only has `Imm8` policy anchors, so `gt05 target_energy=300` cannot yet be encoded directly
  - current `gt05` cases therefore use the representable `band=240` anchor rather than claiming full homeostasis semantics
- mutation-sensitive admission coverage now lives in `verification/admission_shadow_harness.ts`, anchored to `gt04_plasmid_inject`, `gt06_daemon_admission_case`, and `gt07_daemon_policy_block`
- next gate is no longer "cover `gt04` somehow"; it is deciding whether a real compare/range primitive belongs in the bridge, or whether those policy-first cases should remain outside reduction for now

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
- `GENETIC_LEDGER.ts` now defines the initial bounded registry for homeostasis, pressure-ring, daemon ingress, and federation degrade knobs.
- [docs/migration/HORMONE_LEDGER_CONTRACT.md](/Users/s0fractal/OMEGA/docs/migration/HORMONE_LEDGER_CONTRACT.md) is now the explicit Stage 7 contract artifact and is included in export.
- `PHYSIOLOGY_SNAPSHOT.ts` plus `GET /api/physiology` now provide an observer-only runtime projection of hormone / ledger state through `SYSTEM_START.ts` and `AKASHA_SERVER.ts`.
- `GENETIC_LEDGER_RUNTIME.ts` now owns the first live ledger mutation path for `pulse.homeostasis.baseTax`, including rollback-token semantics and observer-visible summary state.
- `GENETIC_LEDGER_PERSISTENCE.ts` now persists and replays `baseTax` ledger events, so rollback tokens survive restart and hydration happens during `PULSE.initWorkers()`.
- contract guards now exist for:
  - [test_hormone_buffer_contract.ts](/Users/s0fractal/OMEGA/test_hormone_buffer_contract.ts)
  - [test_genetic_ledger_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_contract.ts)
  - [test_genetic_ledger_runtime_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_runtime_contract.ts)
  - [test_genetic_ledger_persistence_contract.ts](/Users/s0fractal/OMEGA/test_genetic_ledger_persistence_contract.ts)
  - [test_hormone_ledger_alignment_contract.ts](/Users/s0fractal/OMEGA/test_hormone_ledger_alignment_contract.ts)
  - [test_physiology_snapshot_contract.ts](/Users/s0fractal/OMEGA/test_physiology_snapshot_contract.ts)
  - [test_physiology_api_contract.ts](/Users/s0fractal/OMEGA/test_physiology_api_contract.ts)
  - [test_homeostasis_ledger_path_contract.ts](/Users/s0fractal/OMEGA/test_homeostasis_ledger_path_contract.ts)
- current scope remains deliberately narrow:
  - no live `SharedArrayBuffer` hormone region
  - only `pulse.homeostasis.baseTax` is ledger-owned in live runtime
  - only `pulse.homeostasis.baseTax` currently has durable replay history
  - all other hormone / ledger knobs remain observational or scaffold-only
- next gate is deciding whether `targetEnergy` or `pressureRing.scale` becomes the second ledger-owned knob without diluting rollback discipline.

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

Result:
the spine is visible before any bridge code exists.

### Sprint B

- `GlyphIR64`
- opcode-to-glyph bridge
- first 10-15 mappings

Result:
the new language exists without taking runtime ownership.

### Sprint C

- reduction harness
- parallel verification
- first bounded reduction case

Result:
reduction becomes measurable instead of aspirational.

### Sprint D

- internal glyph buffer
- internal transport
- glyph-aware local behavior

Result:
transport becomes physics.

### Sprint E

- `HORMONE_BUFFER`
- `GENETIC_LEDGER`
- daemon through formal knobs

Result:
homeostasis stops being ad-hoc tuning.

### Sprint F

- one hybrid production path
- fallback
- trace diff

Result:
the new substrate touches live runtime safely.

## Stop signals

Do not advance if:

- golden traces do not exist
- rollback path does not exist
- drift budget is undefined
- reduction and legacy diverge without explanation
- glyph semantics are used in runtime without ledger specification

## Documentation style

For every major stage, maintain two artifacts:

1. `MYTH.md`
   short, expressive, purpose-focused

2. `CONTRACT.md`
   strict:
   - inputs
   - outputs
   - invariants
   - fail modes
   - rollback

This keeps myth and engineering aligned without letting either erase the other.

## Immediate next 3 planning steps

1. Fill [docs/migration/CAUSAL_ATLAS.md](/Users/s0fractal/OMEGA/docs/migration/CAUSAL_ATLAS.md) for the 8 key files.
2. Define the first golden scenarios in [docs/migration/GOLDEN_TRACES.md](/Users/s0fractal/OMEGA/docs/migration/GOLDEN_TRACES.md).
3. Draft the first `GlyphIR64` type contract before any bridge implementation begins.
