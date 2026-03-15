---
id: bondBuffer
type: module
description: "Implementation of bondBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, BONDS_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const bondBuffer = new Uint32Array(sharedBuffer, BONDS_OFFSET, MAX_ATOMS * 4).buffer;
```
