import { walk } from "jsr:@std/fs";
import { basename } from "jsr:@std/path";

const LAYERS = [
  "00_substrate", "01_physics", "02_metabolism", "03_governance",
  "04_noosphere", "05_exocortex", "06_akasha", "63_necropolis", "tests"
];

const fileMap = new Map();
for await (const entry of walk(".", { exts: [".ts"] })) {
  for (const l of LAYERS) {
    if (entry.path.startsWith(`${l}/`)) {
      fileMap.set(entry.name, l);
    }
  }
}

const IMPORT_REGEX = /(from|import)\s+["'](\.\/|\.\.\/|network\/)([^"']+)["']/g;

for await (const entry of walk("tests", { exts: [".ts"] })) {
  const content = await Deno.readTextFile(entry.path);
  let edited = false;
  const newContent = content.replace(IMPORT_REGEX, (match, keyword, relNode, importedPath) => {
    let importedName = basename(importedPath);
    if (!importedName.endsWith(".ts")) importedName += ".ts";

    const targetLayer = fileMap.get(importedName);
    if (!targetLayer) return match;

    let newRel = "";
    if (targetLayer === "tests") {
      newRel = `./${importedName}`;
    } else {
      newRel = `../${targetLayer}/mod.ts`;
    }

    const replacement = `${keyword} "${newRel}"`;
    if (match !== replacement) edited = true;
    return replacement;
  });

  if (edited) {
    console.log("Fixed " + entry.path);
    await Deno.writeTextFile(entry.path, newContent);
  }
}
