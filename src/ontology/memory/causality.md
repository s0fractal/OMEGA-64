---
id: causality
type: module
description: Implementation of causality
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - CAUSALITY_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const causality = new Uint8Array(sharedBuffer, CAUSALITY_OFFSET, MAX_ATOMS);
```
