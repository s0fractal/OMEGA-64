---
id: bonds
type: module
description: Implementation of bonds
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - BONDS_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const bonds = new Uint32Array(sharedBuffer, BONDS_OFFSET, MAX_ATOMS * 4);
```
