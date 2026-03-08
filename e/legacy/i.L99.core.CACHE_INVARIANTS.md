# i.L99.core.CACHE_INVARIANTS.md

# OMEGA-64 | Cache Invariants (Hot Spine)

Purpose:

- Declare invariants that must remain in fast access (hot path).
- Guide future RS/TS "hot barrel" re-exports.

Principles:

- Hot invariants are stable, deterministic, and frequently referenced.
- This list is advisory (noncanonical) until formalized in policy.

Proposed Hot Set (v0):

- i.L00.core.I16_LIMITS
- i.L00.core.U16_LIMITS
- i.L00.core.I16_CLAMP
- i.L99.core.DETERMINISM_LAWS
- i.L99.core.CANON_CAUSAL_INVARIANTS
- i.L99.core.CRYSTALLIZATION_CONFIG
- i.L99.core.STATE_SNAPSHOT
- i.L99.core.TOPOLOGICAL_SIGNATURE
- i.L99.core.LOAD
- i.L99.core.REPLAY_AUDIT

Notes:

- Keep this list short. Add only when a module becomes a structural dependency.
- Hot set should be mirrored in RS/TS barrels once established.
