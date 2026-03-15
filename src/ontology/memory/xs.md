---
id: xs
type: module
description: "Implementation of xs"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, XS_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const xs = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS);
```
