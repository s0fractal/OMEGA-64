# OMEGA-64 | Mutation Lanes (Era 69)

## Purpose

Define a stable contract between external ingress, canonical governance, and
internal high-speed mutation loops.

## Lanes

### 1) External Ingress Lane (Untrusted)

- Surfaces: `AKASHA_SERVER.ts`, `P2P_SYNAPSE.ts`, `SYSTEM_START.ts`,
  UI/WebSocket clients.
- Default posture: read-only visualization.
- Any external mutation endpoint must be disabled by default, local-bind only,
  and protected by explicit operator intent (env gate/token).
- External ingress must not mutate `STATE_MATRIX` directly.

### 2) Canonical Governance Lane (Authoritative)

- Surface: `GATE.mutate(...)`.
- Must emit canonical ledger/checkpoint artifacts and respect bridge policy.
- This lane is the source of truth for auditable state transitions.

### 3) Internal Fast Lane (Sandbox / Throughput)

- Surfaces: pulse kernel orchestration, oracle/synapse-assisted adaptation,
  local sandbox dynamics.
- Optimized for speed and experimentation inside the runtime.
- Allowed to bypass per-action governance checks, but should remain observable
  through telemetry and periodic audits.
- Runtime observer: `MUTATION_TELEMETRY.ts` (aggregated counters for host/oracle
  direct writes).
- Oracle writes are serialized via pending queue and drained in `HOST_LOCK`
  (`SOVEREIGN_ORACLE.drainPendingMutations()` from `PULSE.ts`).
- Controls:
  - `OMEGA_MUTATION_TELEMETRY` (`true` by default)
  - `OMEGA_MUTATION_TELEMETRY_FLUSH_TICKS` (default `25`)
  - `OMEGA_MUTATION_TELEMETRY_TOP_KINDS` (default `6`)
  - `OMEGA_ORACLE_PENDING_MAX` (default `256`)

## Current Runtime Posture

- `AKASHA_SERVER.ts`: visualization-only websocket channel, local bind by
  default.
- `P2P_SYNAPSE.ts`: `/mutate` endpoint is disabled by default and guarded by
  env/token gates when enabled; accepts canonical `x-omega-control-token`
  (legacy `x-omega-mutate-token` remains compatible).
- `P2P_FEDERATION.ts`: migration queue is disabled by default
  (`OMEGA_FEDERATION_ENABLE=false`) and forwards `x-omega-control-token` when
  set to interoperate with guarded `/federate`.
- `SYSTEM_START.ts`: binds loopback by default (`OMEGA_SYSTEM_HOST`) and all
  mutating POST routes require explicit control enable/token
  (`OMEGA_SYSTEM_CONTROL_ENABLE`, `OMEGA_SYSTEM_CONTROL_TOKEN`); mutating
  requests are enqueued into `CONTROL_INTENT_QUEUE.ts`.
- Canonical crystallization remains in `GATE`.
- Internal fast-lane mutations are aggregated and emitted by
  `MUTATION_TELEMETRY.flushIfDue(...)` from `PULSE.ts`.
- External control intents are drained and applied only during `HOST_LOCK`
  (`CONTROL_INTENT_QUEUE.applyHostLockBudget()` in `PULSE.ts`).
- Runtime env gates and thresholds are parsed centrally in `RUNTIME_POLICY.ts`
  and consumed by runtime modules (policy monoculture).
