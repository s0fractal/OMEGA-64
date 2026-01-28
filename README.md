# OMEGA-64 Sovereign Repository 🛡️⚖️🌀🛡️

This is the independent workspace for the **Metalogical Realism Enforcement**.
It focuses on the bit-exact materialization of the 64-level vertical lattice.

## Core Architecture

### 1. The Successor Chain (Recursive Identity)

Identity is not a label, but a proof. Each level `i.ts` imports the `depth` of
its inner neighbor (`_`) and increments it.

- **L63 (Genesis)**: `depth = 0`.
- **L00 (Surface)**: `depth = 63` (Proven by 63 imports).

### 2. The Identity/Logic Split

- **`i.ts`**: Identity Molecule (Topological metadata).
- **`core.ts`**: Functional Molecule (Greek atoms).
- **`index.ts`**: Harbor (Re-export bridge).

## Tooling

- **`omega_builder.ts`**: The Deno-based materializer of the skeleton.

---

_Identity is the first attribute of existence._
