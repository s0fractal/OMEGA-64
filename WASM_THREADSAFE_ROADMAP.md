# WASM Thread-Safe Roadmap (Deno + AssemblyScript)

## Why this roadmap exists

- Multiple WASM instances currently share one `SharedArrayBuffer`.
- Earlier, this produced sporadic lattice corruption (spontaneous nonzero IDs in empty matrix).
- Recent fixes (hot-path no-allocation rewrite + coherence guards) restored stable 4-worker operation.
- We keep this roadmap to prevent regressions and harden concurrency further.

Current guardrail:

- Default runtime is 4 workers (`OMEGA_PULSE_WORKERS` optional override).
- Coherence baseline test is mandatory in verify flow.

## Phase 1: Deterministic Baseline (completed)

- Enforce memory-layout coherence before build (`wasm_layout_guard.ts`).
- Add empty-matrix coherence test (`test_wasm_worker_coherence.ts`).
- Remove hot-path heap allocations in `assembly/index.ts` (array literals).

Acceptance:

- `deno task vector10:verify` stays green.
- `test_wasm_worker_coherence.ts` stays green with `OMEGA_PULSE_WORKERS=4`.

## Phase 2: Parallel hardening (next)

- Completed: extend coherence test to long run (`>=1000` ticks) via `deno task test:worker-coherence:long`.
- Completed: add stress seeds with mixed VM opcodes, spawn pressure, and structure writes via `test_spawn_determinism.ts` (`deno task test:spawn-determinism`).
- Completed: worker-level fault counters + safe timeout retry-windows (no duplicate posts) in `PULSE.ts`, validated by `test_worker_timeout_retry.ts`.
- Completed: parallel timeout-retry hardening gate (`test_worker_timeout_retry_multi.ts`) for `OMEGA_PULSE_WORKERS=4` with per-worker recovery assertions.
- Completed: chaos jitter gate (`test_worker_jitter_resilience.ts`) with per-worker randomized response delays and zero-drift assertions on empty matrix.
- Completed: spawn-pressure chaos gate (`test_spawn_jitter_resilience.ts`) combining jittered worker responses with active replication load and world-bound invariants.

Acceptance:

- `OMEGA_PULSE_WORKERS=4 deno run -A test_wasm_worker_coherence.ts` is green for at least 1000 ticks.
- `deno task test:spawn-determinism` remains green (strict 1-worker vs 4-worker hash parity under spawn pressure).
- `deno task test:worker-timeout-retry`, `deno task test:worker-timeout-retry:multi`, `deno task test:worker-jitter-resilience`, and `deno task test:spawn-jitter-resilience` remain green (retry counters increment, zero failed requests, zero drift/invariant breach under empty and spawn-pressure modes).

## Phase 3: Safety gates

- Completed: startup self-test at worker init:
  - run dry ticks on empty matrix;
  - if nonzero atoms appear, auto-fallback to `1` worker for current process.
- Validation gates:
  - `deno task test:startup-selftest-fallback` (breach -> fallback);
  - `deno task test:startup-selftest-nominal` (clean start, no fallback, stop/init lifecycle reset).
- Completed CI matrix gate:
  - GitHub Actions workflow at `.github/workflows/coherence-worker-matrix.yml`;
  - `OMEGA_PULSE_WORKERS=4` required;
  - `OMEGA_PULSE_WORKERS=1` fallback gate.
- Completed nightly soak sentinel:
  - GitHub Actions workflow at `.github/workflows/coherence-nightly-soak.yml`;
  - executes long 4-worker coherence burn-in + jitter chaos gate + spawn-pressure jitter gate + drift audit artifact upload.
- Completed regression alignment:
  - include `test_tensegrity.ts` in `vector10:verify` (`deno task test:tensegrity`).

Acceptance:

- No spontaneous atoms in either mode.
- No regression in `test_resonance_protocol.ts`, `test_swarm.ts`, `test_tensegrity.ts` (enforced by verify chain).
- Long-run 4-worker soak remains green (`test:worker-coherence:long` + `test:worker-jitter-resilience` + `test:spawn-jitter-resilience` + `test:worker-drift-audit`).
