# i.L99.core.DIPOLE_IMPORT_AUDIT.md
# OMEGA-64 | Dipole Import Audit

Purpose:
- Enforce the RS/TS import axis as a deterministic constraint.
- Detect drift in dependency direction across layers.

Default Policy:
- RS: ASCEND (L00 → L63)
- TS: DESCEND (L63 → L00)
- Mode: WARN (non-fatal)

Usage:
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --rs ASCEND --ts DESCEND --mode WARN
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --mode FAIL
- deno run -A i.L99.core.DIPOLE_IMPORT_AUDIT.ts --include-noncanonical

Notes:
- Only files named i.Lxx.* are scanned.
- Lxx must be 00..63 (others ignored).
- Noncanonical files are skipped unless explicitly included.
