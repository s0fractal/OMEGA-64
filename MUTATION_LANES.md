# OMEGA-64 | Mutation Lanes (Era 69)

## Purpose

Define a stable contract between external ingress, canonical governance, and
internal high-speed mutation loops.

## Lanes

### 1) External Ingress Lane (Untrusted)

- Surfaces: `AKASHA_SERVER.ts`, `P2P_SYNAPSE.ts`, UI/WebSocket clients.
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
- Controls:
  - `OMEGA_MUTATION_TELEMETRY` (`true` by default)
  - `OMEGA_MUTATION_TELEMETRY_FLUSH_TICKS` (default `25`)
  - `OMEGA_MUTATION_TELEMETRY_TOP_KINDS` (default `6`)

## Current Runtime Posture

- `AKASHA_SERVER.ts`: visualization-only websocket channel, local bind by
  default.
- `P2P_SYNAPSE.ts`: `/mutate` endpoint is disabled by default and guarded by
  env/token gates when enabled.
- Canonical crystallization remains in `GATE`.
- Internal fast-lane mutations are aggregated and emitted by
  `MUTATION_TELEMETRY.flushIfDue(...)` from `PULSE.ts`.
