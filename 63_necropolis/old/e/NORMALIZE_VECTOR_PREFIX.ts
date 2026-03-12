import { walk } from "jsr:@std/fs";

const root = Deno.cwd();
const pad2 = (n: number | string) => String(n).padStart(2, "0");
let touched = 0;

for await (const entry of walk(root, { includeDirs: false })) {
  if (!entry.isFile || !entry.name.endsWith(".yaml")) continue;
  const rel = entry.path.replaceAll("\\", "/");
  const match = rel.match(/(?:^|\/)([0-8])\/([0-7])\/[^/]+\/_.yaml$/);
  if (!match) continue;
  const sector = Number(match[1]);
  const orbit = Number(match[2]);
  const text = await Deno.readTextFile(entry.path);
  const vecMatch = text.match(
    /vector:\s*['"]?(\d{1,2})\.(\d{1,2})\.(\d{1,2})['"]?/,
  );
  const v = vecMatch ? Number(vecMatch[3]) : 0;
  const newVector = `vector: ${pad2(sector)}.${pad2(orbit)}.${pad2(v)}`;
  const next = vecMatch
    ? text.replace(/vector:\s*['"]?\d{1,2}\.\d{1,2}\.\d{1,2}['"]?/, newVector)
    : text;
  if (next !== text) {
    await Deno.writeTextFile(entry.path, next);
    touched++;
  }
}

console.log(`NORMALIZE_VECTOR_PREFIX updated ${touched} files.`);
