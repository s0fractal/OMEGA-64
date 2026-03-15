---
id: lineageBuffer
type: module
description: "Implementation of lineageBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, LINEAGE_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const lineageBuffer = new BigUint64Array(sharedBuffer, LINEAGE_OFFSET, MAX_ATOMS).buffer;
```
