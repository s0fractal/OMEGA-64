---
id: read_jsonl_lines
type: module
description: "Lightweight JSONL array reader"
tags: []
min_level: 0
---

### TypeScript
```typescript
export const read_jsonl_lines = async (path: string): Promise<string[]> => {
  try {
    const raw = await Deno.readTextFile(path);
    return raw.split("\n").map((x) => x.trim()).filter((x) => x.length > 0);
  } catch {
    return [];
  }
};
```
