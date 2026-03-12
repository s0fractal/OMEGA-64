# i.L99.core.MOUNT_SPEC.md

# OMEGA-64 | Mount Spec (Dot-Fold Modules)

Purpose:

- Define how external repositories mount into dot-fold topology.

Principles:

- Canonical id remains dot-fold (segments joined by ".").
- Mounts are projections; they do not overwrite canonical ids.
- Mounts may be lazy (on-demand) or eager (preloaded).

Mount Record (suggested):

- mount_id: unique name (e.g., "ext.lodash")
- source: git/url/path
- root: path within source repo
- prefix: dot-fold prefix to apply (e.g., "i.ext.lodash")
- mode: "lazy" | "eager"
- trust: "readonly" | "verified" | "signed"

Resolution:

1. Load mount record.
2. Enumerate files under source/root.
3. Convert path segments to dot-fold ids.
4. Apply prefix.
5. Expose as virtual projection (no canonical overwrite).

Notes:

- Conflicts resolve by prefixing or explicit aliasing.
- Canon remains immutable; mounts are external lenses.
