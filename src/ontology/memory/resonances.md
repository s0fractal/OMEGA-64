---
id: resonances
type: module
description: Implementation of resonances
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - RESONANCE_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const resonances = new Int32Array(sharedBuffer, RESONANCE_OFFSET, MAX_ATOMS);
```
