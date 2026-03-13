---
id: prng_next
type: pure_fn
dataType: null
returns: u32
level: 1
args:
  state: u32
deps: []
vars: []
---

---
---

```rust
    state.wrapping_mul(1664525).wrapping_add(1013904223)
```

```typescript
    return (state * 1664525 + 1013904223) | 0;
```

```assemblyscript
  return (state * 1664525 + 1013904223) | 0;
```
