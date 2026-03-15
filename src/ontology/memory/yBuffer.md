---
id: yBuffer
type: module
description: "Implementation of yBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, YS_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const yBuffer = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS).buffer;
```
