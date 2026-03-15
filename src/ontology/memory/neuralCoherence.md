---
id: neuralCoherence
type: module
description: "Implementation of neuralCoherence"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [NEURAL_COHERENCE_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const neuralCoherence = new Int32Array(sharedBuffer, NEURAL_COHERENCE_OFFSET, 1);
```
