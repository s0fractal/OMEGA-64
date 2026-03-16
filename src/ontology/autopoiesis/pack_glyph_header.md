---
id: pack_glyph_header
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  kind: i32
  amplitude: i32
description: Auto-recovered pack_glyph_header
deps:
  - TYPES
---

---
---

```rust
unimplemented!()
```

```typescript




if (amplitude < -12000) amplitude = -12000;
if (amplitude > 12000) amplitude = 12000;
return (amplitude << 8) | (kind & 0xFF);
```

```assemblyscript
if (amplitude < -12000) amplitude = -12000;
if (amplitude > 12000) amplitude = 12000;
return (amplitude << 8) | (kind & 0xFF);
```
