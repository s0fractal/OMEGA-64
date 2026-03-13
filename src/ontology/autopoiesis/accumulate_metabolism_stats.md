---
id: accumulate_metabolism_stats
type: pure_fn
dataType: null
returns: void
level: 1
args:
  startIdx: i32
  endIdx: i32
vars:
  - IDS_OFFSET
  - METABOLISM_SCRATCH_OFFSET
deps:
  - OMEGA_MEMORY_LAYOUT
  - genome_key16
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  for (let i = startIdx; i < endIdx; i++) {
    const pId = IDS_OFFSET + (i << 3) as usize;
    if (load<i64>(pId) == 0) continue;

    const key = genome_key16(i);
    // Atomic add to genome frequency map in scratch space
    atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (key << 2), 1);
    // Atomic add to global population counter (scratch end)
    atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4), 1);
  }
```
