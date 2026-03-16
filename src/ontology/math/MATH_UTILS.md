---
id: MATH_UTILS
type: module
description: Unified performance-optimized math utilities for OMEGA-64.
entry: true
tags: []
deps:
  - C_LOG2_C_LUT
  - TYPES
extra_symbols:
  - MATH_UTILS
  - normalize_angle
  - clamp01
  - fast_sign
  - calculate_shannon_entropy
---

### TypeScript

```typescript




export function normalize_angle(angle: number): number {
  const tau = 2 * Math.PI;
  let a = angle % tau;
  if (a < 0) a += tau;
  return a / tau;
}

export function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export function fast_sign(v: number): number {
  return (v >> 31) | ((<number><unknown>-v) >>> 31);
}

export function calculate_shannon_entropy(data: Uint8Array): number {
  // Stub for TS/WASM bridge
  return 0;
}
```

### Rust

```rust
pub fn normalize_angle(angle: f64) -> f64 {
    let tau = 2.0 * std::f64::consts::PI;
    let mut a = angle % tau;
    if a < 0.0 {
        a += tau;
    }
    a / tau
}

pub fn clamp01(x: f64) -> f64 {
    if x < 0.0 {
        0.0
    } else if x > 1.0 {
        1.0
    } else {
    }
}

pub fn fast_sign(v: i32) -> i32 {
    (v >> 31) | ((-v as u32) >> 31) as i32
}

pub fn calculate_shannon_entropy(data: &[u8; 64]) -> i32 {
    let mut counts = [0i32; 256];
    for &b in data.iter() {
        counts[b as usize] += 1;
    }

    let mut sum_c_log_c = 0;
    for &c in counts.iter() {
        if c > 0 {
            sum_c_log_c += C_LOG2_C_LUT[c as usize];
        }
    }

    let mut entropy = 6000 - (sum_c_log_c >> 6);
    
    if entropy < 0 {
        entropy = 0;
    } else if entropy > 6000 {
        entropy = 6000;
    }
    
}
```

### AssemblyScript

```assemblyscript
export function normalize_angle(angle: f64): f64 {
  const tau: f64 = 2.0 * Math.PI;
  let a: f64 = angle % tau;
  if (a < 0.0) a += tau;
  return a / tau;
}

export function clamp01(x: f64): f64 {
  if (x < 0.0) return 0.0;
  if (x > 1.0) return 1.0;
  return x;
}

export function fast_sign(v: i32): i32 {
  return (v >> 31) | (<i32>(<u32>-v) >>> 31);
}

export function calculate_shannon_entropy(data: usize): i32 {
  // Logic not yet ported to pure AS without LUT access
  return 0;
}
```
