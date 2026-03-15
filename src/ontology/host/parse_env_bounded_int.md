---
id: parse_env_bounded_int
type: module
description: "Implementation of parse_env_bounded_int"
tags: []
min_level: 0
---

### TypeScript
```typescript
export const parse_env_bounded_int = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};
```
