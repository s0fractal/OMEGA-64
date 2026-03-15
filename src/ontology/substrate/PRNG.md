---
id: PRNG
type: module
epoch: 8
description: >-
  The Immutable Deterministic Oracle. A seeded Linear Congruential Generator
  (LCG) for reproducible evolution. Immutable to prevent race conditions in the
  Memory Matrix.
tags:
  - 00_substrate
  - prng
  - oracle
  - deterministic
extra_symbols:
  - PRNG
  - prng_next
  - prng_seed_from
---

# OMEGA-64 | PRNG.ts | The Immutable Deterministic Oracle

A seeded Linear Congruential Generator (LCG) for reproducible evolution.
In Era 8, this is immutable to prevent race conditions in the Memory Matrix.

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

/**
 * Static helper to derive a seed from tick and atom ID.
 * @param tick Current system tick
 * @param atomId The ID of the atom
 * @returns number 
 */
export function prng_seed_from(tick: number, atomId: string): number {
  let hash = tick;
  for (let i = 0; i < atomId.length; i++) {
    hash = ((hash << 5) - hash) + atomId.charCodeAt(i);
    hash |= 0; // Convert to 32bit int
  }
  return Math.abs(hash);
}

export const PRNG = {
  prng_next,
  prng_seed_from
};

```
