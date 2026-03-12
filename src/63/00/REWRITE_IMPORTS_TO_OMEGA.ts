/// <reference lib="deno.window" />
import { walk } from "jsr:@std/fs";
import { dirname, relative, resolve } from "jsr:@std/path";

const ROOT = Deno.cwd();
const CANON_ROOTS = Array.from({ length: 9 }, (_, i) => `${ROOT}/${i}`);
const MOD_PATH = `${ROOT}/mod.ts`;

type ExportMap = Map<string, Map<string, string>>;

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

const modMap = loadModMap();

const importRe =
  /import\s+(type\s+)?\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["']\s*;?/g;

const unresolved: string[] = [];
let rewriteCount = 0;

function canonRelPath(importPath: string): string | null {
  const parts = importPath.replaceAll("\\", "/").split("/");
  const idx = parts.findIndex((p) => /^[0-8]$/.test(p));
  if (idx === -1) return null;
  return parts.slice(idx).join("/");
}

for (const root of CANON_ROOTS) {
  try {
    for await (const entry of walk(root, { includeDirs: false })) {
      if (entry.name !== "_.ts") continue;

      const filePath = entry.path;
      const fileDir = dirname(filePath);
      const fileRel = relative(ROOT, filePath).replaceAll("\\", "/");
      const fileSector = fileRel.split("/")[0] ?? "";
      const source = await Deno.readTextFile(filePath);
      let touched = false;

      const updated = source.replace(
        importRe,
        (full, typeKw, specList, modPath) => {
          if (!modPath.startsWith(".") && !modPath.startsWith("/")) return full;
          const abs = resolve(fileDir, modPath);
          const rel = relative(ROOT, abs).replaceAll("\\", "/");
          if (!rel.endsWith("_.ts")) return full;
          let byOrig = modMap.get(rel);
          if (!byOrig) {
            const altRel = canonRelPath(modPath);
            if (altRel) {
              byOrig = modMap.get(altRel);
              if (!byOrig && fileSector && /^[0-8]$/.test(fileSector)) {
                const prefixed = `${fileSector}/${altRel}`;
                byOrig = modMap.get(prefixed);
              }
            }
          }
          if (!byOrig) {
            unresolved.push(`${filePath} -> ${modPath}`);
            return full;
          }

          const specs = specList.split(",").map((s) => s.trim()).filter(
            Boolean,
          );
          const nextSpecs: string[] = [];

          for (const spec of specs) {
            const typePrefix = spec.startsWith("type ") ? "type " : "";
            const raw = spec.replace(/^type\s+/, "");
            const [leftRaw, rightRaw] = raw.split(/\s+as\s+/i);
            const orig = (leftRaw ?? "").trim();
            const local = (rightRaw ?? leftRaw ?? "").trim();
            let alias = byOrig.get(orig);
            if (!alias && byOrig.get("ATOM")) {
              alias = byOrig.get("ATOM");
            }
            if (!alias) {
              unresolved.push(`${filePath} -> ${modPath} :: ${orig}`);
              return full;
            }
            if (alias === local) {
              nextSpecs.push(`${typePrefix}${alias}`);
            } else {
              nextSpecs.push(`${typePrefix}${alias} as ${local}`);
            }
          }

          touched = true;
          rewriteCount += 1;
          return `import ${typeKw ?? ""}{ ${
            nextSpecs.join(", ")
          } } from "@omega";`;
        },
      );

      if (touched) {
        await Deno.writeTextFile(filePath, updated);
      }
    }
  } catch {
    // root may not exist
  }
}

console.log(`[OMEGA] import rewrites: ${rewriteCount}`);
if (unresolved.length > 0) {
  console.warn("[OMEGA] unresolved imports (left unchanged):");
  for (const item of unresolved) console.warn(` - ${item}`);
}
