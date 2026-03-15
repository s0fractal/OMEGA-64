---
id: idBuffer
type: module
description: "Implementation of idBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, IDS_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const idBuffer = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS).buffer;
```
