---
id: PRNG
type: module
description: Deterministic PRNG wrapper class for simulation consistency.
tags:
  - host
deps:
  - prng_seed_from
  - prng_next
  - TYPES
vars:
  - prng_seed_from
  - prng_next
min_level: 6
extra_symbols:
  - PRNG
---


```typescript




export class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  public static seedFrom(tick: number, atomId: string): number {
    return prng_seed_from(tick, atomId);
  }

  public next(): { value: number; nextState: number } {
    const result = prng_next(this.state);
    this.state = result.nextState;
    return result;
  }
}
```
