// SSoT: file:///Users/s0fractal/OMEGA/I/host/read_jsonl_lines.md

export const read_jsonl_lines = async (path: string): Promise<string[]> => {
  try {
    const raw = await Deno.readTextFile(path);
    return raw.split("\n").map((x) => x.trim()).filter((x) => x.length > 0);
  } catch {
    return [];
  }
};
