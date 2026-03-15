---
id: parse_env_bool
type: module
description: "Implementation of parse_env_bool"
tags: []
min_level: 0
---

### TypeScript
```typescript
export const parse_env_bool = (
  raw: string | undefined,
  fallback: boolean,
): boolean => {
  if (raw === undefined) return fallback;
  const norm = raw.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") {
    return true;
  }
  if (norm === "0" || norm === "false" || norm === "no" || norm === "off") {
    return false;
  }
  return fallback;
};
```
