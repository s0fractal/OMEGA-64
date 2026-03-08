# i.L99.core.TOPOLOGY_FOLDING.md

# OMEGA-64 | Topology Folding Law

Statement:

- Dot-notation is the canonical projection of depth.
- Physical directories are optional lenses; the canonical coordinate is the
  dot-fold id.

Canonical ID:

- `i.Lxx.layer.Name` is the minimal coordinate.
- Canonical id = path segments joined by dots.
- Directory paths are projections only (fold/unfold at will).

Folding Rules:

1. Split canonical id by `.` to build a virtual tree.
2. No empty segments.
3. No leading/trailing dots.
4. No double dots (`..`).

Escaping:

- If a semantic name requires a dot, encode it (e.g. `%2E`).

Implications:

- A flat file list and a deep folder tree are equivalent views.
- Scaling the lattice does not depend on OS path limits.
