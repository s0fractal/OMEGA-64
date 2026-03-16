// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/append_jsonl.md
import { TYPES } from "@g00";

export const append_jsonl = async (
  path: string,
  entry: unknown,
): Promise<void> => {
  await Deno.writeTextFile(path, JSON.stringify(entry) + "\n", {
    append: true,
    create: true,
  });
};
