---
id: ATOM_INDEX
type: module
epoch: 8
description: "Lightweight ID↔Index registry shared across runtime modules."
tags: ["00_substrate", "atom", "registry", "index"]
---

# OMEGA-64 | ATOM_INDEX.ts

Lightweight ID↔Index registry shared across runtime modules.

```typescript
export const ID_TO_IDX = new Map<string, number>();
export const IDX_TO_ID = new Map<number, string>();

export const ATOM_INDEX = {
  ID_TO_IDX,
  IDX_TO_ID
};

```
