---
id: genome_key16
type: pure_fn
description: Read the first two logic bytes of an atom
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - LOGIC_OFFSET
args:
  idx: i32
rsArgs:
  state: '&SigmaState'
  idx: i32
returns: i32
---

### Rust
```rust
let b0 = state.matrix.logic[idx as usize][0] as i32;
let b1 = state.matrix.logic[idx as usize][1] as i32;
(b0 << 8) | b1
```


```typescript
 b0 

b0 

b0 

b0 

const b0 = dataView.getUint8(LOGIC_OFFSET + (idx << 3));
const b1 = dataView.getUint8(LOGIC_OFFSET + (idx << 3) + 1);
return (b0 << 8) | b1;
```


```assemblyscript
const ptr = LOGIC_OFFSET + (idx << 3);
const b0 = load<u8>(ptr) as i32;
const b1 = load<u8>(ptr + 1) as i32;
return (b0 << 8) | b1;
```
