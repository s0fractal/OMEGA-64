---
id: prng_seed_from
type: module
epoch: 8
description: >-
  Static helper to derive a deterministic seed from tick and atom ID.
tags:
  - 00_substrate
  - prng
  - oracle
  - deterministic
min_level: 0
---

# OMEGA-64 | prng_seed_from.ts | The Immutable Deterministic Oracle

```typescript
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
    hash |= 0; // Convert to 32bit integer
  }
  return (hash >>> 0);
}
```

```assemblyscript
// @ts-ignore
@inline
export function prng_seed_from(tick: u32, atomId: string): u32 {
  let hash = tick;
  for (let i = 0; i < atomId.length; i++) {
    hash = ((hash << 5) - hash) + atomId.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
```
