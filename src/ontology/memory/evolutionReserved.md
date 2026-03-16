---
id: evolutionReserved
type: module
description: Implementation of evolutionReserved
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - EVOLUTION_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const evolutionReserved = new Int32Array(sharedBuffer, EVOLUTION_OFFSET, MAX_ATOMS);
```
