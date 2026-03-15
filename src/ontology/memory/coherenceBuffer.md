---
id: coherenceBuffer
type: module
description: "Implementation of coherenceBuffer"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [COHERENCE_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const coherenceBuffer = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1).buffer;
```
