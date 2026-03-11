import { walk } from "jsr:@std/fs";
import { basename, join } from "jsr:@std/path";

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

const IMPORT_REGEX = /(from|import)\s+["'](\.\/|\.\.\/|network\/)([^"']+)["']/g;

async function processDir(dirName: string) {
  let count = 0;
  for await (const entry of walk(dirName, { exts: [".ts"] })) {
    const content = await Deno.readTextFile(entry.path);
    let edited = false;

    const newContent = content.replace(IMPORT_REGEX, (match, keyword, relNode, importedPath) => {
      let importedName = basename(importedPath);
      if (!importedName.includes(".")) importedName += ".ts";

      const tLayer = fileMap.get(importedName);
      if (!tLayer) return match; // Could be a root file like SYSTEM_START, which usually works correctly from root path, but let's handle if it breaks

      let newRel = "";
      if (dirName === "tests") {
        if (tLayer === "tests") newRel = `./${importedName}`;
        else newRel = `../${tLayer}/mod.ts`;
      } else if (dirName === ".") {
        newRel = `./${tLayer}/mod.ts`; 
      } else {
        // Source is in a layer 00-63
        if (tLayer === dirName) newRel = `./${importedName}`;
        else newRel = `../${tLayer}/mod.ts`;
      }

      // Avoid self-referencing inside mod.ts
      if (entry.name === "mod.ts" && newRel === `./mod.ts`) return match;

      const rep = `${keyword} "${newRel}"`;
      if (match !== rep && !entry.path.startsWith("tests/test_runtime")) edited = true;
      return rep;
    });

    if (edited) {
      await Deno.writeTextFile(entry.path, newContent);
      count++;
    }
  }
  return count;
}

async function main() {
  let totalFixed = 0;
  totalFixed += await processDir("tests");
  for (const l of LAYERS.filter(x => x !== "tests")) {
    totalFixed += await processDir(l);
  }
  
  console.log(`v4 rewriter fixed ${totalFixed} files.`);
}
main();
