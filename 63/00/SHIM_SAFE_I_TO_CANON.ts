/// <reference lib="deno.window" />
import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";

const ROOT = Deno.cwd();
const I_DIR = `${ROOT}/i`;
const LEGACY_DIR = `${ROOT}/o/legacy/i`;

const symbolToPath = new Map<string, string>();

// Build map from _.yaml
for await (
  const entry of walk(ROOT, { includeDirs: false, match: [/\/_.yaml$/] })
) {
  const rel = entry.path.replace(`${ROOT}/`, "");
  const match = rel.match(/^(\d)\/(\d)\/([^/]+)\/_.yaml$/);
  if (!match) continue;
  try {
    const raw = parseYaml(await Deno.readTextFile(entry.path)) as Record<
      string,
      unknown
    >;
    const symbol = typeof raw?.symbol === "string" ? raw.symbol : match[3];
    if (!symbolToPath.has(symbol)) {
      symbolToPath.set(symbol, `${match[1]}/${match[2]}/${symbol}/_.ts`);
    }
  } catch {
    // ignore
  }
}

const isLocalImport = (content: string): boolean => {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes("import") && !line.includes("export")) continue;
    if (line.match(/from\s+["'](\.|\.\.)\//)) return true;
    if (line.match(/import\s+["'](\.|\.\.)\//)) return true;
    if (line.match(/export\s+\*\s+from\s+["'](\.|\.\.)\//)) return true;
  }
  return false;
};

let shimmed = 0;
let skipped = 0;
let missing = 0;

const pattern = /^i\.L(\d{2})\.core\.([A-Z0-9_]+)\.ts$/;

for await (const entry of walk(I_DIR, { includeDirs: false, maxDepth: 1 })) {
  const name = entry.name;
  const match = name.match(pattern);
  if (!match) continue;
  const symbol = match[2];
  const canonRel = symbolToPath.get(symbol);
  if (!canonRel) {
    missing++;
    continue;
  }

  const filePath = `${I_DIR}/${name}`;
  const content = await Deno.readTextFile(filePath);
  if (content.includes("AUTO-SHIM")) {
    skipped++;
    continue;
  }

  if (isLocalImport(content)) {
    skipped++;
    continue;
  }

  // backup
  await Deno.mkdir(LEGACY_DIR, { recursive: true });
  await Deno.writeTextFile(`${LEGACY_DIR}/${name}`, content);

  const shim = `// AUTO-SHIM: canonical at ${canonRel}\n` +
    `// Legacy: ${name}\n` +
    `export * from "../${canonRel}";\n`;
  await Deno.writeTextFile(filePath, shim);
  shimmed++;
}

console.log(
  `[SHIM_SAFE] shimmed=${shimmed} skipped=${skipped} missing=${missing}`,
);
