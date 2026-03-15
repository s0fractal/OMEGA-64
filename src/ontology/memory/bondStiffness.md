---
id: bondStiffness
type: module
description: "Implementation of bondStiffness"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, STIFFNESS_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const bondStiffness = new Float32Array(sharedBuffer, STIFFNESS_OFFSET, MAX_ATOMS * 4);
```
