# i.L99.core.QWAVE_BRIDGE.md

# OMEGA-64 | QWAVE BRIDGE (Projection, Not Canon)

Purpose: Translate OMEGA q-canon into SIGMA .qwave as a transport/projection
layer without altering OMEGA truth.

Non-goals: This bridge MUST NOT define canonical identity, evaluation, or
hashing for OMEGA. It MUST NOT replace OMEGA q-canon or ledger rules.

Source of Truth: OMEGA q-canon = i.Lxx.q (packed values) and i.q (aggregate).
SIGMA .qwave = projection-only artifact.

Mapping (OMEGA q → SIGMA qwave WaveVectorK): theta ← hue (u16) phi ← phi (u16)
amplitude ← 65535 (constant, deterministic) entropy ← evt (i16) omega_theta ← 0
omega_phi ← 0 reserved ← 0 trajectories count ← 0

Header Fields: magic = "QWAV" version = 0x0100 flags = 0x0000 glyph_id_hash =
SHA-256(OMEGA id) first 8 bytes block_height = ledger anchor height (if
absent, 0) timestamp = ledger time (MUST NOT use wall clock)

Endianness: qwave packing follows SIGMA qwave spec (Little-Endian). OMEGA
internal scalar semantics remain unchanged.

Determinism Constraints: All fields must be derived from canonical q-canon and
ledger anchors only. No randomness, no Date.now, no hidden system state.

Status: Projection-only. Canon remains in OMEGA.
