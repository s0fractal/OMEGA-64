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

async function main() {
  let count = 0;
  for await (const entry of walk("reduction_core", { exts: [".ts"] })) {
    const content = await Deno.readTextFile(entry.path);
    let edited = false;
    // reduction_core is at depth 1 or 2
    let depth = entry.path.split("/").length - 1;
    let up = "";
    for(let i = 0; i < depth; i++) up += "../";

    const newContent = content.replace(IMPORT_REGEX, (match, keyword, relNode, importedPath) => {
      let importedName = basename(importedPath);
      if (!importedName.includes(".")) importedName += ".ts";

      const tLayer = fileMap.get(importedName);
      if (!tLayer) return match; 

      const newRel = `${up}${tLayer}/mod.ts`;
      const rep = `${keyword} "${newRel}"`;
      if (match !== rep) edited = true;
      return rep;
    });

    if (edited) {
      await Deno.writeTextFile(entry.path, newContent);
      console.log(`Fixed ${entry.path}`);
      count++;
    }
  }
  console.log(`Fixed ${count} files in reduction_core`);
}

main();
