# i.L99.core.QUANTUM_VIEW.md

# OMEGA-64 | QUANTUM VIEW (Derived Scalars)

Purpose:

- Provide scalar audit projections from packed q-canon.
- Produce diff-friendly values without altering canon.

Outputs (noncanonical, gitignored):

- i.Lxx.q.hue
- i.Lxx.q.phi
- i.Lxx.q.evt

Rules:

- Generated from i.Lxx.q when present.
- Falls back to i.Lxx.q.ts legacy seed if packed q is missing.
- Must never be treated as canon.

Usage:

- deno task q:view
- deno task q:view:clean
