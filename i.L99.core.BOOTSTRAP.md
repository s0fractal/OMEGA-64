# i.L99.core.BOOTSTRAP.md
# OMEGA-64 | BOOTSTRAP (Dry-Boot)

Purpose:
- Read I.sigma.md and emit a deterministic manifest (no code execution).

Constraints:
- No eval/vm execution.
- Pure read + hash + manifest output.

Outputs:
- I.sigma.manifest.json (cells: id, lang, hash, bytes, lines)

Ritual:
1) Inhale: parse I.sigma.md
2) Index: compute hashes + sizes
3) Emit: manifest JSON

Notes:
- This is a safety-first ignition step.
- Execution remains gated by GLIDER/L32 and ledger rules.
