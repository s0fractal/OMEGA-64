import { walk } from "jsr:@std/fs";
import { basename } from "jsr:@std/path";

const LAYERS = [
  "00_substrate", "01_physics", "02_metabolism", "03_governance",
  "04_noosphere", "05_exocortex", "06_akasha", "63_necropolis", "tests"
];

const fileMap = new Map<string, string>();
for await (const entry of walk(".", { exts: [".ts"] })) {
  for (const l of LAYERS) {
    if (entry.path.startsWith(`${l}/`)) {
      fileMap.set(entry.name, l);
    }
  }
}

const IMPORT_REGEX = /(from|import)\s+["'](\.\/|\.\.\/|network\/)([^"']+)["']/g;

for await (const entry of walk(".", { exts: [".ts"], skip: [/^\./, /^sigma_core/, /^omega_vm/, /^omega_wasm/, /^e\//, /^archive\//, /^assembly\//] })) {
  const content = await Deno.readTextFile(entry.path);
  const currentLayerMatch = entry.path.split("/");
  const isRoot = currentLayerMatch.length === 1;
  const currentLayer = isRoot ? 'root' : currentLayerMatch[0];

  let edited = false;
  const newContent = content.replace(IMPORT_REGEX, (match, keyword, relNode, importedPath) => {
    let importedName = basename(importedPath);
    if (!importedName.endsWith(".ts")) importedName += ".ts";

    const targetLayer = fileMap.get(importedName);
    if (!targetLayer) return match;

    let newRel = "";
    if (isRoot) {
      if (targetLayer === 'root') newRel = `./${importedName}`;
      else newRel = `./${targetLayer}/mod.ts`;
    } else {
      if (targetLayer === 'root') {
        newRel = `../${importedName}`;
      } else if (currentLayer === targetLayer) {
        newRel = `./${importedName}`;
      } else {
        newRel = `../${targetLayer}/mod.ts`;
      }
    }

    // Don't replace self-imports if it mistakenly hits (it shouldn't)
    if (newRel === "./mod.ts" && entry.name === "mod.ts") {
      return match;
    }

    const replacement = `${keyword} "${newRel}"`;
    if (match !== replacement) edited = true;
    return replacement;
  });

  if (edited) {
    await Deno.writeTextFile(entry.path, newContent);
  }
}
console.log("Imports fixed second pass.");
