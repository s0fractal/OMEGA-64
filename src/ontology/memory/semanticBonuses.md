---
id: semanticBonuses
type: module
description: Implementation of semanticBonuses
tags:
  - 00_memory
deps:
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
min_level: 0
---

### TypeScript
```typescript




export const semanticBonuses = new Int32Array(new SharedArrayBuffer(MAX_ATOMS * Int32Array.BYTES_PER_ELEMENT));
```
