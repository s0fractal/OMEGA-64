# i.L99.core.DETERMINISM_CHECKLIST.md

# OMEGA-64 | Determinism Checklist (Agent View)

AX/OP (L60–L63, L48–L59):

- One file = one exported lambda.
- Export name must match file identity (address = essence).
- No Math.*, no Date/Time, no RNG, no I/O.
- Only fixed-point or LUT-derived values.

FL (L32–L47):

- Branching allowed only if deterministic.
- No RNG or time-based branching.
- Export name must match file identity (address = essence).

PJ/DR (L00–L31):

- Experimental logic is allowed.
- Must tag non-canonical or experimental when nondeterministic.

Canon rule:

- If in doubt, stay non-canonical.
