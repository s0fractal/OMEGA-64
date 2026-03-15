---
id: causalityBuffer
type: module
description: "Implementation of causalityBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, CAUSALITY_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const causalityBuffer = new Uint8Array(sharedBuffer, CAUSALITY_OFFSET, MAX_ATOMS).buffer;
```
