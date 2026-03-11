import { walk } from "jsr:@std/fs";
import { basename } from "jsr:@std/path";

const LAYERS = [
  "00_substrate", "01_physics", "02_metabolism", "03_governance",
  "04_noosphere", "05_exocortex", "06_akasha", "63_necropolis", "tests"
];

const fileMap = new Map();
for (const l of LAYERS) {
  try {
    for await (const entry of Deno.readDir(l)) {
      if (entry.isFile && entry.name.endsWith(".ts")) {
        fileMap.set(entry.name, l);
      }
    }
  } catch(e) {}
}

const IMPORT_REGEX = /(from|import)\s+["'](\.\/|\.\.\/)([^"']+)["']/g;

for await (const entry of Deno.readDir(".")) {
  if (entry.isFile && entry.name.endsWith(".ts") && !entry.name.startsWith("fix_") && entry.name !== "phase52.ts" && entry.name !== "phase52_fix.ts") {
    const content = await Deno.readTextFile(entry.name);
    let edited = false;
    const newContent = content.replace(IMPORT_REGEX, (match, keyword, relNode, importedPath) => {
      let importedName = basename(importedPath);
      if (!importedName.includes(".")) importedName += ".ts";

      const tLayer = fileMap.get(importedName);
      if (!tLayer) return match; 

      const newRel = `./${tLayer}/mod.ts`;
      const rep = `${keyword} "${newRel}"`;
      if (match !== rep) edited = true;
      return rep;
    });

    if (edited) {
      await Deno.writeTextFile(entry.name, newContent);
      console.log(`Fixed ${entry.name}`);
    }
  }
}
