---
id: ids
type: module
description: "Implementation of ids"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, IDS_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const ids = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS);
```
