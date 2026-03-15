---
id: prng_next
type: module
epoch: 8
description: >-
  Generates the next value and the subsequent state for the PRNG.
tags:
  - 00_substrate
  - prng
  - oracle
  - deterministic
min_level: 0
---

# OMEGA-64 | prng_next.ts | The Immutable Deterministic Oracle

```typescript
/**
 * Generates the next value and the subsequent state for the PRNG.
 * @param state The current seed state.
 * @returns { value: number, nextState: number }
 */
export function prng_next(state: number): { value: number; nextState: number } {
  // LCG constants from Numerical Recipes
  const nextState = (state * 1664525 + 1013904223) >>> 0;
  return {
    value: nextState / 0xFFFFFFFF,
    nextState,
  };
}
```

```assemblyscript
// @ts-ignore
@inline
export function prng_next(state: u32): u32 {
  return (state * 1664525 + 1013904223);
}
```
