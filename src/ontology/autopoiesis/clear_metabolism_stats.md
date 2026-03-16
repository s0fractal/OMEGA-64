---
id: clear_metabolism_stats
type: pure_fn
dataType: null
returns: void
level: 1
args: {}
vars:
  - METABOLISM_SCRATCH_OFFSET
deps:
  - OMEGA_MEMORY_LAYOUT
---
```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  // Clear genome count scratch (65536 * 4 bytes = 256KB)
  // and generic stats (population, noveltyDelta, symbiosisDelta, etc)
  memory.fill(METABOLISM_SCRATCH_OFFSET, 0, (65536 * 4) + 64);
```
