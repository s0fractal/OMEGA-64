# i.L99.core.ANNOTATION_PROTOCOL.md

# OMEGA-64 | Annotation Protocol (Invariant Geometry)

Purpose:

- Define a minimal, canonical set of annotations used as topological laws.
- Keep invariants in code bodies stable while geometry lives in metadata.

Scope:

- Applies to files in /i (canonical invariants).
- An annotation without a physical effect is treated as noise.

Required Annotation:

- @omega.vector <L.D.P>
  - Example: @omega.vector 31.41.6
  - L: 00..63 (level)
  - D: 00..63 (domain)
  - P: 00..15 (port/variant)
  - Format: exactly three dot-separated 2-digit integers (DD.DD.DD)
  - Example (padded): @omega.vector 32.05.06

Optional Annotations:

- @omega.readonly
  - Declares immutable projection (no mutation allowed).
- @omega.port <0..65535>
  - Declares explicit network binding.
- @omega.unfold <Lxx>
  - Declares unfolding target layer.
- @omega.load <number>
  - Declares load impact (used by LOAD and REPLAY).
- @omega.symbol <glyph>
  - Declares a semantic glyph (optional, recorded as note).
- @omega.origin <path>
  - Declares migration source path (optional, recorded as note).
- @omega.redirect <path>
  - Declares migration redirect target (optional, recorded as note).

Validity Rules:

- Any file in /i without @omega.vector is invalid.
- @omega.port must be a valid u16.
- @omega.unfold must be 00..63.
- @omega.load must be >= 0.
- Domain phase mapping: domain * (360 / 64) degrees.

Physical Effect Requirement:

- Each annotation must alter at least one of: LOAD, FIELD, REPLAY.
- If no effect exists, the annotation is rejected by IMMUNE.
