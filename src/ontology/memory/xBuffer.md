---
id: xBuffer
type: module
description: "Implementation of xBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, XS_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const xBuffer = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS).buffer;
```
