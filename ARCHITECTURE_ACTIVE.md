# OMEGA-64 | Active Architecture (Era 69)

This document is the canonical architecture snapshot for active runtime and
export context. It intentionally excludes historical era narratives.

## Runtime Topology (Active)

1. Host orchestration: `PULSE.ts`
2. Shared substrate: `STATE_MATRIX.ts` + `OFFSETS.ts` (`SharedArrayBuffer`).
   Requires bit-exact memory correspondence between Host and WASM kernel offsets
   (e.g., literal `8,000,000` bytes vs binary `8MiB` alignment).
3. Execution plane: `PULSE_WORKER.ts` + `build/release.wasm`
4. Governance plane: `GATE.ts` + `SHIMS.ts`
5. Snapshot/continuity plane: `STATE_SNAPSHOT.ts`, `SNAP.ts`,
   `SNAPSHOT_ENGINE.ts`
6. Operator/observer plane: `OBSERVER_UI.ts`, `ui/index.html` Akasha signaling
   membrane exposes WebRTC rendezvous via `ws://<akasha>/rtc/signal` +
   `/api/webrtc`. Observer UI can form RTC mesh rooms (`rtcRoom`) and exchange
   lightweight telemetry frames over `RTCDataChannel` without routing payloads
   through mutation gate paths. Mesh `plasmid/pheromone` packets are ingested
   only via `/api/webrtc/inject` and forwarded into the existing
   `/api/inject -> CONTROL_INTENT_QUEUE` governance path.
7. Codex/archive plane: `AKASHA_CODEX.ts` (`./codex/species`,
   `./codex/chronicles`, `./codex/relics`, `./codex/invariants`) Human narrative
   bridge: `/codex/narrative`, `/api/codex/narrative`, `/codex/invariants`,
   `/api/codex/invariants`. Observer human channel in `ui/index.html` fuses
   `/api/telemetry` and codex narrative/invariant surfaces into plain-language
   state summaries plus drift deltas over a rolling ~90s window, with
   `LOW/MID/HIGH` drift severity badge, daemon admission summary
   (`daemon_governance.last_admission`) + short admission history
   (`daemon_governance.last_admission_history`), component score breakdown,
   codex lineage-guard cue (`last_admission.codexLineageGuardScore` /
   `codexLineageLabel`) for operator-facing admission pressure visibility,
   compact risk summary + drift trend sparkline, top degrade-reason aggregate,
   phase-ring quadrant badge/trend from canonical pressure-ring history
   (`daemon_governance.last_pressure_ring_history`) with local fallback, and
   scene halo tint driven by `max(drift severity, daemon admission severity)`.

## Runtime Classification Contract (Manifest)

- Source of truth: `CORE_ARCH_MANIFEST.json`.
- `runtime_root_files`: executable entry roots that define active runtime
  closure. Current roots: `SYSTEM_START.ts`, `PULSE.ts`, `PULSE_WORKER.ts`,
  `AKASHA_SERVER.ts`, `OMEGA_DAEMON.ts`, `assembly/index.ts`,
  `MUTATION_TELEMETRY.ts`, `TUI_DASHBOARD.ts`, `AGENT_PROXY.ts`,
  `llm_soul.ts`, `nightly_soak.ts`.
- `runtime_support_files`: operational/support code intentionally exported but
  outside active runtime closure.
- `experimental_files`: explicitly exported experimental surfaces that must not
  be imported by active runtime roots.

## Deterministic Pulse Pipeline

1. `PULSE.initWorkers()` boots worker mesh over shared memory.
2. `BUILD_SPATIAL_HASH` runs on worker-0.
3. `PULSE` phase executes atom kernels across worker ranges.
4. `REDUCE_DELTAS` merges intent deltas deterministically.
5. `TICK_MATRIX` executes structure/signal matrix pass.
6. Host applies sequential actions (bond requests, spawn queue drain).
7. `GATE.tick()` performs admission, budgeting, policy checks, and ledgering.

## Post-69 Enabled Additions

- `ATTENTION_FIELD` is now canonical shared-memory lattice state:
  `OFFSETS.ATTENTION_FIELD_OFFSET` + `STATE_MATRIX.attentionField`.
- Observer presence enters through `/avatar` and decays in host pulse.
- WASM trophism (`assembly/index.ts`) applies role-specific response to
  attention gradients.
- `AKASHA_CODEX` performs epochal taxonomy + chronicle + relic + invariant
  archive scans and serves API snapshots via `/codex*` endpoints.
- `BREATH` now injects the latest Codex chronicle context into Oracle prompts.
- `OMEGA_DAEMON` runs an invariant-compressor pass each heartbeat, persists
  `daemon_invariants.json`, and feeds invariant frames into the LLM decision
  loop before any external action proposal.
- Host pulse now supports deterministic evolution pressure terms: direct
  coefficients (`OMEGA_NOVELTY_PRESSURE`, `OMEGA_SYMBIOSIS_PRESSURE`) and a
  phase-ring mode (`OMEGA_MATRIX_THETA`, `OMEGA_PRESSURE_RING_SCALE`) that
  projects fear/curiosity + ego/love axes on the unit circle. Host applies
  bounded signed energy deltas during `HOST_LOCK` without modifying WASM ISA.
- `OFFSETS.ts` now exposes `validateMemoryLayout()` and `STATE_MATRIX.ts`
  executes the guard at startup (alignment + overlap + wasm-bounds checks) to
  fail fast on silent layout drift before any worker tick starts.
- Runtime exposes `/api/pressure-ring` for authorized daemon control of phase
  updates (`set`/`step`) with bounded theta delta clamps and audit trail
  (`DAEMON_PRESSURE_RING` events + `daemon_pressure_ring_update` telemetry), and
  preserves bounded canonical update history for observers.
- `OMEGA_DAEMON` can run a phase-season scheduler
  (`OMEGA_DAEMON_PHASE_SEASONS_*`) that advances `theta` deterministically from
  telemetry/invariant context while respecting cooldown and safe-mode gates.
- **WASM-Native Secretion Path (Direct Emission)**: The WASM kernel now
  possesses direct authority over glyph emission. Legacy JS-side deposition
  logic has been removed.
  - RISC opcodes `OP_SIGNAL` (0x81) and `OP_COLLECTIVE` (modes 2/7) now consume
    energy and emit glyphs directly via `secreteGlyph`.
  - Grid-based leakage (Signal/Memory -> Pheromone/Plasmid) is handled during
    `tickGlyphTransport` in WASM.
  - Unified 12-index telemetry (`SECRETION_STATS_OFFSET`) tracks role-based
    secretions and internal reflection leaks in shared memory for real-time
    observation.
- **Total Physiological Closure (Endocrine Wiring)**: The Genetic Ledger now
  governs 10 physiological knobs consolidated via `GENERIC_LEDGER_SYSTEM.ts`.
  These are synchronized to a Hormone Shared-Memory Lattice
  (`HORMONE_BUFFER_RUNTIME.ts`) within `STATE_MATRIX`. The WASM kernel directly
  reads these 6 derivation-hormones to modulate physical reality:
  - `entropy_pressure` (H0) scales metabolic cost.
  - `time_viscosity` (H1) dynamically clamps execution budget (8..24 steps).
  - `replication_bias` (H3) shifts the `OP_REPLICATE` energy threshold.
  - `aggression` (H2) scales the `OP_SHARE` percentage.
  - `repair_drive` (H4) modulates resonance decay.
  - `mutation_friction` (H5) adds a metabolic floor to complex operations and
    modulates genome mutation chance.
- **Genetic Evolution (Stage 8.1)**: Atoms possess autonomous genomic mutation
  capabilities.
  - **Mutation Engine**: Introduced stochastic bit-flipping in the 64-bit genome
    during replication.
  - **Replayability**: Mutation is deterministic, derived from `atomId` and
    `systemTicker`.
  - **Stability Control**: `H5 (mutation_friction)` allows the global mind-field
    to freeze or accelerate evolution.
- **Deno-Native Architecture**: The project has fully transitioned to a
  Deno-native environment. Legacy `node_modules`, `package.json`, and
  `package-lock.json` have been removed. AssemblyScript (`0.28.9`) is managed
  via Deno's native NPM resolution in `build_wasm.ts`.
- **Cognitive Vector Protocol**: Transitioned to deterministic integer-based
  Math (`math_sin`, `math_cos`) to ensure 100% causal consistency.
  - **Phase-ring as Cognitive Zodiac**: The internal continuous `theta` phase
    (0-255) maps symmetrically into a 4-quadrant archetype wheel:
    - **Quadrant I (0-63)**: Fear vs Curiosity (Scientist / Analyzer)
    - **Quadrant II (64-127)**: Curiosity vs Ego (Architect / Creator)
    - **Quadrant III (128-191)**: Ego vs Love (Warrior / Extractor)
    - **Quadrant IV (192-255)**: Love vs Fear (Guardian / Protector)
  - **Resonance Dynamics**: Incorporates the Kuramoto model for phase
    synchronization (`OP_RESONATE_KURAMOTO`) with K-coupling dictated strictly
    by global `NEURAL_COHERENCE`, driving atoms into synchronous zodiac phases
    when K > K_critical.
  - **Gas Economics**: Implements precision-gas gradients where `LUT_LERP` and
    `TAYLOR2` exact mathematically higher gas tariffs (5-10x more than fast
    mapping) yielding resource competition under resonant loads.

## Governance and Integrity

- Mutation authority is centralized at `GATE.MUTATE`.
- Daemon ingress (`/api/inject`) now includes an invariant admission layer:
  action plans are scored against codex narrative context (`sharedCenter`,
  dominant invariant vector, safety floors). `MID/HIGH` drift is degraded
  (intensity clamp or plasmid->pheromone conversion) instead of hard blocking.
  Codex species memory now feeds a lineage guard score (dominant epochs +
  historical peak share + active-lineage match) to increase drift pressure on
  aggressive external plasmid ingress during stable lineage windows. Degradation
  rationale is written to daemon audit log and codex chronicles
  (`daemon_admission`) for operator visibility in narrative surfaces.
- Bridge/policy/invariant checks are validated before commit.
- Ledger (`LEDGER__08_00_LEDGER`) uses hash-chain anchoring: `chain_version`,
  `prev_event_hash`, `event_hash`.
- Checkpoint (`CHECKPOINT_CHECKPOINT`) uses hash-chain anchoring:
  `chain_version`, `prev_checkpoint_hash`, `checkpoint_hash`.
- Proposal envelope index has independent hash-chain replay index.

## WASM Boot and Resilience Policy

- Worker init fallback (`OMEGA_WORKER_INIT_FALLBACK`): degrade to single worker
  when partial worker init fails.
- WASM preflight (`OMEGA_WASM_BOOT_PRECHECK`): verifies artifact readability and
  compilability before worker boot.
- Boot policy (`OMEGA_WASM_BOOT_POLICY`):
  - `fail-fast`: startup throws on total worker init failure.
  - `safe-noop`: startup enters degraded mode with `runtimeWorkerCount=0` and
    no-op ticks.
- Startup self-test (`OMEGA_STARTUP_SELFTEST*`) validates cold-start coherence.
  Policy: The test is non-destructive for populated environments; if
  `getActiveIndices()` is non-zero, the test is bypassed to preserve seeded
  state.

## Coherence Gates (Active)

Primary chain:

- `test:runtime-monoculture`
- `test:runtime-support-boundary`
- `test:runtime-experimental-boundary`
- `test:codex-narrative-contract`
- `test:ui-codex-narrative-contract`
- `test:ui-human-channel-contract`
- `test:export-manifest`
- `vector10:verify`
- determinism/parity/projection/bridge/index/ledger/checkpoint runtime tests

Deep chain adds:

- drift/fuzz/intent determinism
- spawn/jitter/timeout resilience
- worker init fallback / total-fail / safe-noop gates
- startup self-test nominal + fallback

## Export Canon

- Export source of truth: `CORE_ARCH_MANIFEST.json`
- Export tool: `export_core.ts`
- Output: `OMEGA_CORE_LOGIC.md`
- Policy: test files and archive/legacy folders are excluded; required active
  files must exist; context is limited to active architecture docs and UI/ops
  surfaces.
