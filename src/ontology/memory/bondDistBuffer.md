---
id: bondDistBuffer
type: module
description: "Implementation of bondDistBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, BOND_DISTANCES_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const bondDistBuffer = new Uint8Array(sharedBuffer, BOND_DISTANCES_OFFSET, MAX_ATOMS * 4).buffer;
```
