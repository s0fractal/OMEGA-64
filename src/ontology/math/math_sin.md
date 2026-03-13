---
id: math_sin
type: pure_fn
description: "Обчислення синуса з динамічною точністю"
deps: 
  - SIN_LUT
  - COS_LUT
vars:
  - SIN_LUT
  - COS_LUT
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
if highRes == 0 {
    let idx = (angle & 255) as usize;
    return SIN_LUT[idx] as i32;
}
let idx = ((angle >> 8) & 255) as usize;
let frac = angle & 255;

if highRes == 1 {
    let v0 = SIN_LUT[idx] as i32;
    let v1 = SIN_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
}

// TAYLOR2
let s_base = SIN_LUT[idx] as i32;
let c_base = COS_LUT[idx] as i32;
let d1 = (c_base * 804) >> 15;
let term1 = (d1 * frac) >> 8;
let d2 = (s_base * 10) >> 15;
let term2 = (d2 * frac * frac) >> 16;
s_base + term1 - term2
```

### TypeScript
```typescript
if (highRes == 0) {
    let idx = angle & 255;
    return SIN_LUT[idx] as i32;
}
let idx = (angle >> 8) & 255;
let frac = angle & 255;

if (highRes == 1) {
    let v0 = SIN_LUT[idx] as i32;
    let v1 = SIN_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
}

let s_base = SIN_LUT[idx] as i32;
let c_base = COS_LUT[idx] as i32;
let d1 = (c_base * 804) >> 15;
let term1 = (d1 * frac) >> 8;
let d2 = (s_base * 10) >> 15;
let term2 = (d2 * frac * frac) >> 16;
return s_base + term1 - term2;
```
