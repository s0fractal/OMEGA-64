---
id: logicBuffer
type: module
description: "Implementation of logicBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, ATOM_GENOME_SIZE, LOGIC_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const logicBuffer = new Uint8Array(sharedBuffer, LOGIC_OFFSET, MAX_ATOMS * ATOM_GENOME_SIZE).buffer;
```
