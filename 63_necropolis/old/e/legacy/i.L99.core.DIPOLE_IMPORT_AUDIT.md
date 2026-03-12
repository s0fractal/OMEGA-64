# i.L99.core.DIPOLE_IMPORT_AUDIT.md

# OMEGA-64 | Dipole Import Audit

Purpose:

- Enforce the RS/TS import axis as a deterministic constraint.
- Detect drift in dependency direction across layers.

Default Policy:

- RS: ASCEND (L00 → L63)
- TS: CONVERGE32 (L00 → L32, L63 → L32)
- Mode: WARN (non-fatal)
- Cache Allowlist: ON (reads i.L99.core.CACHE_INVARIANTS.md)

Usage:

- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --rs ASCEND --ts CONVERGE32
  --mode WARN
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --rs ASCEND --ts DESCEND --mode
  WARN --no-cache
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --mode FAIL
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --include-noncanonical
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --include-index
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --no-cache

Notes:

- Only files named i.Lxx.* are scanned.
- Lxx must be 00..63 (others ignored).
- Noncanonical files are skipped unless explicitly included.
- Index files (i.Lxx.i.ts) are skipped unless --include-index is set.
- Cache allowlist matches snippet text against i.L99.core.CACHE_INVARIANTS.md.
- CONVERGE32 allows only imports that move toward L32.
