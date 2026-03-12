# i.L99.core.MOUNT_LIST.md

# OMEGA-64 | Mount List (Registry)

Purpose:

- Human-readable mount registry for dot-fold modules.

Format:

- One mount record per block.
- Use dot-fold prefix to avoid collisions.

Template:

```
mount_id: ext.example
source: https://example.com/repo.git
root: /
prefix: i.ext.example
mode: lazy
trust: readonly
```

Example:

```
mount_id: ext.std
source: https://deno.land/std
root: /
prefix: i.ext.std
mode: lazy
trust: readonly
```
