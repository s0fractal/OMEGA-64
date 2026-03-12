# i.L99.core.QUANTUM_PACK_SPEC.md

# OMEGA-64 | QUANTUM PACK SPEC (Canonical Q)

Purpose:

- Define the packed q-canon for OMEGA layers.
- Provide deterministic pack/unpack rules for audit + transport.

Canonical Artifacts:

- i.Lxx.q (packed atomic value)
- i.q (aggregate of all L00..L63)

Legacy / Seeds:

- i.Lxx.q.ts is legacy seed only (input for migration).
- i.Lxx.q.md is noncanonical commentary (optional).

Packed Format (i.Lxx.q):

- 12 hex chars, lowercase.
- Layout: [hue:u16][phi:u16][evt:i16]
- hue, phi: unsigned 16-bit (0..65535)
- evt: signed 16-bit, two's complement (−32768..32767)
- No separators. Single line with trailing newline.

Aggregate (i.q):

- 64 lines, ordered L00..L63.
- Each line is the 12-hex packed form from i.Lxx.q.

Strictness:

- Canonical pack MUST be exact length 12.
- Non-hex characters invalidate the record.
- evt is decoded via two's complement:
  - if raw > 32767, evt = raw - 65536

Derived Views (Optional, noncanonical):

- i.Lxx.q.hue / i.Lxx.q.phi / i.Lxx.q.evt
- Used for audit and migration only; can be gitignored.

Determinism:

- No randomness.
- No wall-clock timestamps.
- Canon derived from q-canon and registry only.
