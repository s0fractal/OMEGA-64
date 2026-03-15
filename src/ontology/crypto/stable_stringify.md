---
id: stable_stringify
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
description: Deterministically stringifies JSON objects for signing.
extra_symbols:
  - stable_stringify
---

```typescript
export const stable_stringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return "[" + value.map((v) => stable_stringify(v)).join(",") + "]";
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    return "{" +
      entries.map(([k, v]) => JSON.stringify(k) + ":" + stable_stringify(v))
        .join(",") +
      "}";
  }
  return JSON.stringify(value);
};
```
