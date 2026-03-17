---
id: attentionField
type: module
description: Implementation of attentionField
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - GRID_CELLS
  - ATTENTION_FIELD_OFFSET
min_level: 0
---


```typescript




export const attentionField = new Float32Array(sharedBuffer, ATTENTION_FIELD_OFFSET, GRID_CELLS);
```
