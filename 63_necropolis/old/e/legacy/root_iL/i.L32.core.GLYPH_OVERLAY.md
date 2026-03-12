# i.L32.core.GLYPH_OVERLAY.md

# OMEGA-64 | Glyph Overlay (Bridge Spec)

# "Alias layer, not a replacement."

Purpose:

- Provide a compact, single-symbol alias for canonical atoms.
- Enable prefix (Polish) notation without mutating canon addresses.
- Keep canonical identities stable while allowing dense signal programs.

Non-goals:

- No replacement of canonical atom ids.
- No early optimization into binary glyphs.
- No new semantics beyond existing atoms.

Canon vs Overlay:

- Canonical address stays as i.Lxx.core.NAME.
- Glyph alias is a projection that maps to canonical atoms.
- Overlay can be rebuilt or discarded without affecting canon.

Prefix (Polish) Notation:

- Expression is a stream of glyphs read left-to-right.
- Application arity is resolved by glyph arity and stack.
- Example: "S K I" means apply S to K to I.
- Example: "Y S" means apply Y to S.

Starter Mapping:

- Start with SKIY only, because they are already canonical in OMEGA.
- Mapping uses Sigma seeds as identity anchors.

Future (optional):

- Add glyph compaction into .glyph or .sigma in a separate build step.
- Add fiber-specific glyph alphabets (ts/rs/md) as projections.
