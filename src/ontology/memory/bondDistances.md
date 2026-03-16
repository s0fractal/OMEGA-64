---
id: bondDistances
type: module
description: Implementation of bondDistances
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - BOND_DISTANCES_OFFSET
min_level: 0
---


```typescript




export const bondDistances = new Uint8Array(sharedBuffer, BOND_DISTANCES_OFFSET, MAX_ATOMS * 4);
```
