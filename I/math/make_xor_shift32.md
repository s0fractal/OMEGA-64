---
id: make_xor_shift32
type: module
description: Higher-order functional generator spinning up a PRNG XorShift32 state closure.
tags:
  - host
min_level: 6
deps:
  - TYPES
returns: void
extra_symbols:
  - make_xor_shift32
---


```typescript




export const make_xor_shift32 = (seed: number): () => number => {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
};
```
