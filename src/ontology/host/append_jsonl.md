---
id: append_jsonl
type: module
description: "Lightweight JSONL appender"
tags: []
min_level: 0
---

### TypeScript
```typescript
export const append_jsonl = async (
  path: string,
  entry: unknown,
): Promise<void> => {
  await Deno.writeTextFile(path, JSON.stringify(entry) + "\n", {
    append: true,
    create: true,
  });
};
```
