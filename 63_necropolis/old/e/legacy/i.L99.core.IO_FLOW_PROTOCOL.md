# i.L99.core.IO_FLOW_PROTOCOL.md

# OMEGA-64 | IO Flow Protocol (I → O → I)

Purpose:

- Separate canonical state (I) from effect/output stream (O).
- Enable multi-actor concurrency without blocking or global locks.

Model:

- I: canonical, read-only state snapshot (source of truth).
- O: append-only output/proposal stream (effects, intent, observations).
- Collapse: gated transformation from O to new I (consensus + invariants).

Why this matters (engineering):

- Concurrency safety: writers append to O instead of mutating I.
- Deterministic replay: O is an ordered log; I can be rebuilt.
- Conflict isolation: divergent outputs do not corrupt canon until collapsed.
- Backpressure control: collapse rate can be tuned independently of output rate.
- Multi-agent compatibility: many producers, one canonicalizer.

Invariants:

- O never mutates I directly.
- Collapse requires replayGreen + drift bounds.
- I changes are always ledgered and reversible.

Analogs:

- Event sourcing (O = event log, I = materialized view).
- CRDT staging (O = operations, I = converged state).
- Blockchain (O = mempool, I = chain state).

Implications:

- IO becomes a topology: flow is visible, controllable, and auditable.
- Deadlocks minimized: no shared state mutation, only proposals.
- Sovereignty increased: canon changes only via consented collapse.
