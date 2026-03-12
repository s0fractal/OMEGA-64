import { walk } from "jsr:@std/fs";

const root = Deno.cwd();
const pad2 = (n: string) => n.padStart(2, "0");
let touched = 0;

for await (const entry of walk(root, { includeDirs: false })) {
  if (!entry.isFile || !entry.name.endsWith(".yaml")) continue;
  const rel = entry.path.replaceAll("\\", "/");
  if (!/(?:^|\/)[0-8]\/[0-7]\/[^/]+\/_.yaml$/.test(rel)) continue;
  const text = await Deno.readTextFile(entry.path);
  const next = text.replace(
    /vector:\s*['"]?(\d{1,2})\.(\d{1,2})\.(\d{1,2})['"]?/,
    (_m, a, b, c) => {
      return `vector: ${pad2(a)}.${pad2(b)}.${pad2(c)}`;
    },
  );
  if (next !== text) {
    await Deno.writeTextFile(entry.path, next);
    touched++;
  }
}

console.log(`NORMALIZE_VECTOR_00 updated ${touched} files.`);
