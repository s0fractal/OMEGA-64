/** SSoT: {@link ../../ontology/host/append_jsonl.md} */

export const append_jsonl = async (
  path: string,
  entry: unknown,
): Promise<void> => {
  await Deno.writeTextFile(path, JSON.stringify(entry) + "\n", {
    append: true,
    create: true,
  });
};
