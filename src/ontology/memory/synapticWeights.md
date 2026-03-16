---
id: synapticWeights
type: module
description: Implementation of synapticWeights
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - SYNAPTIC_WEIGHTS_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const synapticWeights = new Uint8Array(sharedBuffer, SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4);
```
