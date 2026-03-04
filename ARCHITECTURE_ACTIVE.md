# OMEGA-64 | Active Architecture (Era 69)

This document is the canonical architecture snapshot for active runtime and
export context. It intentionally excludes historical era narratives.

## Runtime Topology (Active)

1. Host orchestration: `PULSE.ts`
2. Shared substrate: `STATE_MATRIX.ts` + `OFFSETS.ts` (`SharedArrayBuffer`)
3. Execution plane: `PULSE_WORKER.ts` + `build/release.wasm`
4. Governance plane: `GATE.ts` + `SHIMS.ts`
5. Snapshot/continuity plane: `STATE_SNAPSHOT.ts`, `SNAP.ts`,
   `SNAPSHOT_ENGINE.ts`
6. Operator/observer plane: `OBSERVER_UI.ts`, `ui/index.html`
7. Codex/archive plane: `AKASHA_CODEX.ts` (`./codex/species`,
   `./codex/chronicles`, `./codex/relics`)
   Human narrative bridge: `/codex/narrative` and `/api/codex/narrative`.

## Runtime Classification Contract (Manifest)

- Source of truth: `CORE_ARCH_MANIFEST.json`.
- `runtime_root_files`: executable entry roots that define active runtime
  closure.
  Current roots: `SYSTEM_START.ts`, `PULSE.ts`, `PULSE_WORKER.ts`,
  `AKASHA_SERVER.ts`, `OMEGA_DAEMON.ts`, `assembly/index.ts`.
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
- `AKASHA_CODEX` performs epochal taxonomy + chronicle + relic scans and serves
  API snapshots via `/codex*` endpoints.
- `BREATH` now injects the latest Codex chronicle context into Oracle prompts.

## Governance and Integrity

- Mutation authority is centralized at `GATE.MUTATE`.
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

## Coherence Gates (Active)

Primary chain:

- `test:runtime-monoculture`
- `test:runtime-support-boundary`
- `test:runtime-experimental-boundary`
- `test:codex-narrative-contract`
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
