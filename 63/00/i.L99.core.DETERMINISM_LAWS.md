# i.L99.core.DETERMINISM_LAWS.md

# OMEGA-64 | Determinism Laws (v1)

# "Not a style. A physics."

Scope:

- Applies to canonical evolution and crystallization.
- Bands are inferred from L-levels (AX/OP/FL/PJ/DR).

Law 01 — Deterministic Substrate (AX/OP) Where: L48–L63 (AX/OP band) Rule: Only
fixed-point (i16/u16), LUT, or canonical integer ops. Forbidden: Math._, floats,
randomness, system time, I/O (including console._). Enforcement: Gate + Replay
Audit. Sanction: Reject + ViolationEvent on write.

Law 02 — Pure Morphism (AX/OP) Where: L48–L63 (AX/OP band) Rule: One file = one
pure lambda. No side effects. Enforcement: Gate static check. Sanction: Reject.

Law 03 — Causal Entry (AX/OP/FL) Where: L32–L63 (FL/OP/AX band) Rule: Structural
mutation requires invariant_packet_hash AND replayGreen. Enforcement: MUTATE +
CANON_CAUSAL_BRIDGE. Sanction: Reject.

Law 04 — Controlled Branching (FL) Where: L32–L47 (FL band) Rule: Branching
allowed only if deterministic (no RNG, no Date/Time). Enforcement: Replay Audit.
Sanction: Reject (no crystallization).

Law 04b — Canonical Limits (AX/OP/FL) Where: L32–L63 (FL/OP/AX band) Rule: No
direct i16/u16 limit literals (32767, -32768, 65535, 65536, 32768). Must use
canonical imports (I16_LIMITS / I16_CLAMP / U16_LIMITS). Enforcement:
Determinism law audit. Sanction: Reject (must refactor to canon limits).

Law 04c — Export Identity (AX/OP/FL) Where: L32–L63 (FL/OP/AX band) Rule:
Exported symbol name must match file identity. Format: export {NAME} ↔
i.L{n}.{layer}.{NAME}.ts (address = essence). Enforcement: Determinism law
audit. Sanction: Reject (rename export or file; alias allowed only outside
canon).

IO Boundary:

- Side-channel IO (console/logging, fetch, sockets) is forbidden from L32+
  (FL/OP/AX).
- Substrate IO (file operations) is permitted in FL when required by the bridge.
- IO is permitted in PJ/DR as telemetry but must not mutate canonical state.

Law 05 — Marked Entropy (PJ/DR) Where: L00–L31 (PJ/DR band) Rule: Any
non-deterministic or empirical logic must be explicitly tagged
non-canonical/experimental. Enforcement: Crystallization gate (soft). Sanction:
Allowed to exist, forbidden to crystallize.

Law 06 — Cross-Substrate Mirror (AX/OP) Where: L48–L63 (AX/OP band) Rule:
Canonical atoms must have Lean/Rust/UI mirrors or explicit exemption.
Enforcement: Cross-substrate audit. Sanction: Reject from canon until mirrored.

Law 07 — Spectral Concordance (AX/OP/FL) Where: L32–L63 (FL/OP/AX band) Rule:
Canonical atoms must converge across spectral projections. Minimum: ≥2 lenses;
mismatch beyond threshold fails canon readiness. Enforcement: Spectral audit
(SPECTRAL_INVARIANTS). Sanction: Reject from canon until lenses converge.

Law 08 — Topology Folding (AX/OP/FL) Where: L32–L63 (FL/OP/AX band) Rule:
Canonical atom IDs must be valid dot-fold coordinates. Requirements: no empty
segments, no leading/trailing dots, no double dots. Canonical ID = path segments
joined by dots (directories are projections only). Enforcement: Determinism law
audit. Sanction: Reject (rename to canonical dot-fold id).

Notes:

- These are physical constraints for canonization, not general development
  rules.
- Outside these bands, creativity is permitted but must not claim canon.
- The @noncanonical tag exempts any band from determinism checks but
  disqualifies canonization.

Principle: "The lattice compiles itself not by success, but by incompatibility
with its own principles. Stability is a consequence, not a precondition."
