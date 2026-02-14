# i.L99.core.DETERMINISM_LAWS.md
# OMEGA-64 | Determinism Laws (v1)
# "Not a style. A physics."

Scope:
- Applies to canonical evolution and crystallization.
- Bands are inferred from L-levels (AX/OP/FL/PJ/DR).

Law 01 — Deterministic Substrate (AX/OP)
Where: L48–L63 (AX/OP band)
Rule: Only fixed-point (i16/u16), LUT, or canonical integer ops.
Forbidden: Math.*, floats, randomness, system time, I/O (including console.*).
Enforcement: Gate + Replay Audit.
Sanction: Reject + ViolationEvent on write.

Law 02 — Pure Morphism (AX/OP)
Where: L48–L63 (AX/OP band)
Rule: One file = one pure lambda. No side effects.
Enforcement: Gate static check.
Sanction: Reject.

Law 03 — Causal Entry (AX/OP/FL)
Where: L32–L63 (FL/OP/AX band)
Rule: Structural mutation requires invariant_packet_hash AND replayGreen.
Enforcement: MUTATE + CANON_CAUSAL_BRIDGE.
Sanction: Reject.

Law 04 — Controlled Branching (FL)
Where: L32–L47 (FL band)
Rule: Branching allowed only if deterministic (no RNG, no Date/Time).
Enforcement: Replay Audit.
Sanction: Reject (no crystallization).

IO Boundary:
- IO (console/logging) is forbidden from L48+ (AX/OP).
- IO is permitted in FL/PJ/DR as telemetry but must not affect state.

Law 05 — Marked Entropy (PJ/DR)
Where: L00–L31 (PJ/DR band)
Rule: Any non-deterministic or empirical logic must be explicitly tagged non-canonical/experimental.
Enforcement: Crystallization gate (soft).
Sanction: Allowed to exist, forbidden to crystallize.

Law 06 — Cross-Substrate Mirror (AX/OP)
Where: L48–L63 (AX/OP band)
Rule: Canonical atoms must have Lean/Rust/UI mirrors or explicit exemption.
Enforcement: Cross-substrate audit.
Sanction: Reject from canon until mirrored.

Notes:
- These are physical constraints for canonization, not general development rules.
- Outside these bands, creativity is permitted but must not claim canon.
- The @noncanonical tag exempts any band from determinism checks but disqualifies canonization.

Principle:
"The lattice compiles itself not by success, but by incompatibility with its own principles.
Stability is a consequence, not a precondition."
