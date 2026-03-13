---
id: normalize_angle
type: pure_fn
description: "Normalizes an angle to a uniform [0.0, 1.0) range derived from Tau (2 * PI)."
tags: []
deps: []
args:
  angle: f64
returns: f64
tests:
  - [0.0, 0.0]
  - [6.283185307179586, 0.0]
  - [3.141592653589793, 0.5]
  - [-3.141592653589793, 0.5]
---

### Rust
```rust
let tau = 2.0 * std::f64::consts::PI;
let mut a = angle % tau;
if a < 0.0 {
    a += tau;
}
a / tau
```

### TypeScript
```typescript
const tau = 2 * Math.PI;
let a = angle % tau;
if (a < 0) a += tau;
return a / tau;
```

### AssemblyScript
```assemblyscript
const tau: f64 = 2.0 * Math.PI;
let a: f64 = angle % tau;
if (a < 0.0) a += tau;
return a / tau;
```
