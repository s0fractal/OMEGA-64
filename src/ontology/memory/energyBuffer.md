---
id: energyBuffer
type: module
description: "Implementation of energyBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, ENERGY_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const energyBuffer = new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS).buffer;
```
