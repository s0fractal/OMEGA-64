---
id: lineage
type: module
description: Implementation of lineage
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - LINEAGE_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const lineage = new BigUint64Array(sharedBuffer, LINEAGE_OFFSET, MAX_ATOMS);
```
