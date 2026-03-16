---
id: energies
type: module
description: Implementation of energies
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - ENERGY_OFFSET
min_level: 0
---


```typescript




export const energies = new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS);
```
