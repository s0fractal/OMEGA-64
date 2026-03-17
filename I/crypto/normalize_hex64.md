---
id: normalize_hex64
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps:
  - TYPES
description: Validates and normalizes 64-character hex strings (sha256 format).
extra_symbols:
  - normalize_hex64
---

```typescript




export const normalize_hex64 = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return /^[a-f0-9]{64}$/u.test(t) ? t : null;
};
```
