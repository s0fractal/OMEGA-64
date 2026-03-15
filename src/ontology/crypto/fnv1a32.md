---
id: fnv1a32
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Host implementation of the FNV-1a 32-bit hash.
extra_symbols:
  - fnv1a32
---

```typescript
export const fnv1a32 = (input: string): number => {
  let hash = 0x811C9DC5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};
```
