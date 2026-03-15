---
id: phaseBuffer
type: module
description: "Implementation of phaseBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, PHASE_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const phaseBuffer = new Int32Array(sharedBuffer, PHASE_OFFSET, MAX_ATOMS).buffer;
```
