// OMEGA-64 | stream_utils.ts
// Lightweight JSONL appender and reader generator

export const appendJsonl = async (
  path: string,
  entry: unknown,
): Promise<void> => {
  await Deno.writeTextFile(path, JSON.stringify(entry) + "\n", {
    append: true,
    create: true,
  });
};

export const readJsonl = async function* (path: string): AsyncGenerator<any> {
  try {
    const raw = await Deno.readTextFile(path);
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      try {
        yield JSON.parse(t);
      } catch {
        // skip malformed rows for compatibility
      }
    }
  } catch {
    // no file => empty stream
  }
};

export const readJsonlLines = async (path: string): Promise<string[]> => {
  try {
    const raw = await Deno.readTextFile(path);
    return raw.split("\n").map((x) => x.trim()).filter((x) => x.length > 0);
  } catch {
    return [];
  }
};
