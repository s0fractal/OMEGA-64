---
id: resonanceBuffer
type: module
description: "Implementation of resonanceBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, RESONANCE_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const resonanceBuffer = new Int32Array(sharedBuffer, RESONANCE_OFFSET, MAX_ATOMS).buffer;
```
