/// <reference lib="deno.window" />
import { walk } from "jsr:@std/fs";
import { dirname, relative, resolve } from "jsr:@std/path";

const ROOT = Deno.cwd();
const MOD_PATH = `${ROOT}/mod.ts`;
const SHIM_ROOT = `${ROOT}/e/legacy`;

type ExportMap = Map<string, Map<string, string>>;
type ShimMap = Map<string, string>;

function loadModMap(): ExportMap {
  const text = Deno.readTextFileSync(MOD_PATH);
  const re =
    /export\s+\{\s*([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)\s*\}\s+from\s+["']\.\/([^"']+)["']\s*;?/g;
  const map: ExportMap = new Map();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const orig = m[1];
    const alias = m[2];
    const relPath = m[3].replaceAll("\\", "/");
    const byOrig = map.get(relPath) ?? new Map();
    byOrig.set(orig, alias);
    map.set(relPath, byOrig);
  }
  return map;
}

function loadShimMap(): ShimMap {
  const map: ShimMap = new Map();
  const shimRe = /export\s+\*\s+from\s+["'](.+?)["']/;
  try {
    for (const entry of Deno.readDirSync(SHIM_ROOT)) {
      // only files in legacy root (flat) and nested legacy shims
      if (entry.isDirectory) continue;
      if (!entry.name.endsWith(".ts")) continue;
      const path = `${SHIM_ROOT}/${entry.name}`;
      const content = Deno.readTextFileSync(path);
      if (!content.includes("AUTO-SHIM")) continue;
      const match = content.match(shimRe);
      if (!match) continue;
      const relTarget = match[1].replaceAll("\\", "/");
      const canon = relative(ROOT, resolve(SHIM_ROOT, relTarget)).replaceAll(
        "\\",
        "/",
      );
      map.set(`e/legacy/${entry.name}`, canon);
    }

    // also scan nested legacy shims
    for (const entry of walkSync(SHIM_ROOT)) {
      if (!entry.path.endsWith(".ts")) continue;
      const rel = relative(ROOT, entry.path).replaceAll("\\", "/");
      const content = Deno.readTextFileSync(entry.path);
      if (!content.includes("AUTO-SHIM")) continue;
      const match = content.match(shimRe);
      if (!match) continue;
      const relTarget = match[1].replaceAll("\\", "/");
      const canon = relative(ROOT, resolve(dirname(entry.path), relTarget))
        .replaceAll("\\", "/");
      map.set(rel, canon);
    }
  } catch {
    // no legacy shim root
  }
  return map;
}

function* walkSync(
  root: string,
): IterableIterator<Deno.DirEntry & { path: string }> {
  const stack: string[] = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const entry of Deno.readDirSync(dir)) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory) stack.push(path);
      else yield { ...entry, path };
    }
  }
}

const modMap = loadModMap();
const shimMap = loadShimMap();
const baseToCanon = new Map<string, string[]>();
for (const canonPath of modMap.keys()) {
  const parts = canonPath.split("/");
  if (parts.length < 3) continue;
  const base = parts[parts.length - 2];
  const list = baseToCanon.get(base) ?? [];
  if (!list.includes(canonPath)) list.push(canonPath);
  baseToCanon.set(base, list);
}

const overrideByBase = new Map<string, string>([
  ["VOID", "4/6/VOID/_.ts"],
  ["MUTATE", "2/4/MUTATE/_.ts"],
  ["LOOP", "5/3/LOOP/_.ts"],
]);

const importRe =
  /import\s+(type\s+)?\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["']\s*;?/g;

const targets: string[] = [];
try {
  for await (const entry of walk(`${ROOT}/tests`, { includeDirs: false })) {
    if (entry.path.endsWith(".ts")) targets.push(entry.path);
  }
} catch {
  // no tests dir
}
try {
  for await (
    const entry of walk(`${ROOT}/SINGULARITY`, { includeDirs: false })
  ) {
    if (entry.path.endsWith(".ts")) targets.push(entry.path);
  }
} catch {
  // no SINGULARITY
}

const unresolved: string[] = [];
let rewriteCount = 0;

for (const filePath of targets) {
  const fileDir = dirname(filePath);
  const source = await Deno.readTextFile(filePath);
  let touched = false;

  const updated = source.replace(
    importRe,
    (full, typeKw, specList, modPath) => {
      if (!modPath.startsWith(".") && !modPath.startsWith("/")) return full;
      const abs = resolve(fileDir, modPath);
      const rel = relative(ROOT, abs).replaceAll("\\", "/");
      let canon = shimMap.get(rel);
      if (!canon) {
        const match = rel.match(/(?:^|\/)i\.L\d+\.core\.([A-Za-z0-9_]+)\.ts$/);
        if (match) {
          const base = match[1];
          if (base) {
            canon = overrideByBase.get(base);
            if (!canon) {
              const candidates = baseToCanon.get(base) ?? [];
              if (candidates.length === 1) canon = candidates[0];
            }
          }
        }
      }
      if (!canon) {
        unresolved.push(`${filePath} -> ${modPath}`);
        return full;
      }
      const byOrig = modMap.get(canon);
      if (!byOrig) {
        unresolved.push(`${filePath} -> ${modPath}`);
        return full;
      }

      const specs = specList.split(",").map((s) => s.trim()).filter(Boolean);
      const nextSpecs: string[] = [];
      for (const spec of specs) {
        const typePrefix = spec.startsWith("type ") ? "type " : "";
        const raw = spec.replace(/^type\s+/, "");
        const [leftRaw, rightRaw] = raw.split(/\s+as\s+/i);
        const orig = (leftRaw ?? "").trim();
        const local = (rightRaw ?? leftRaw ?? "").trim();
        let alias = byOrig.get(orig);
        if (!alias && byOrig.get("ATOM")) alias = byOrig.get("ATOM");
        if (!alias) {
          unresolved.push(`${filePath} -> ${modPath} :: ${orig}`);
          return full;
        }
        if (alias === local) nextSpecs.push(`${typePrefix}${alias}`);
        else nextSpecs.push(`${typePrefix}${alias} as ${local}`);
      }

      touched = true;
      rewriteCount += 1;
      return `import ${typeKw ?? ""}{ ${nextSpecs.join(", ")} } from "@omega";`;
    },
  );

  if (touched) {
    await Deno.writeTextFile(filePath, updated);
  }
}

console.log(`[OMEGA] test import rewrites: ${rewriteCount}`);
if (unresolved.length > 0) {
  console.warn("[OMEGA] unresolved test imports (left unchanged):");
  for (const item of unresolved) console.warn(` - ${item}`);
}
