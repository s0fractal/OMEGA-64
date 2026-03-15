---
id: synapticWeightBuffer
type: module
description: "Implementation of synapticWeightBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, SYNAPTIC_WEIGHTS_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const synapticWeightBuffer = new Uint8Array(sharedBuffer, SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4).buffer;
```
