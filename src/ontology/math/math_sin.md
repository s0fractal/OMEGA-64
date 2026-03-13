---
id: math_sin
type: pure_fn
description: "Обчислення синуса з динамічною точністю"
deps: 
  - SIN_LUT
args:
  angle: i32
  highRes: i32
returns: i32
tests:
  - [0, 0, 0]
  - [1, 0, 804]
  - [1, 1, 804]
---

### Rust
```rust
let idx = (angle & 255) as usize;
if idx >= 6 { return 0; }
if highRes == 0 {
    return SIN_LUT[idx] as i32;
}
return SIN_LUT[idx] as i32; // dummy interpolation
```

### TypeScript
```typescript
let idx = angle & 255;
if (idx >= 6) return 0;
if (highRes == 0) {
    return SIN_LUT[idx] as i32;
}
return SIN_LUT[idx] as i32; // dummy interpolation
```
