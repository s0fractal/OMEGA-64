import { walk } from "jsr:@std/fs";
import { basename, join } from "jsr:@std/path";

const LAYERS = [
  "00_substrate", "01_physics", "02_metabolism", "03_governance",
  "04_noosphere", "05_exocortex", "06_akasha", "63_necropolis", "tests"
];

const fileMap = new Map();
// Record mapping from physical files in layers
for (const l of LAYERS) {
  try {
    for await (const entry of Deno.readDir(l)) {
      if (entry.isFile && entry.name.endsWith(".ts")) {
        fileMap.set(entry.name, l);
      }
    }
  } catch(e) {}
}

const roots = ["SYSTEM_START.ts", "PULSE.ts", "PULSE_WORKER.ts", "AKASHA_SERVER.ts", "OMEGA_DAEMON.ts", "MUTATION_TELEMETRY.ts", "TUI_DASHBOARD.ts", "AGENT_PROXY.ts", "llm_soul.ts", "nightly_soak.ts", "build_wasm.ts", "env.json", "deno.jsonc", "CORE_ARCH_MANIFEST.json"];
for (const r of roots) fileMap.set(r, "root");

const IMPORT_REGEX = /(from|import)\s+["'](\.\/|\.\.\/|network\/)([^"']+)["']/g;

async function processDir(dirName: string) {
  let count = 0;
  for await (const entry of walk(dirName, { exts: [".ts"] })) {
    const content = await Deno.readTextFile(entry.path);
    let edited = false;

    const currentLayer = dirName === "." ? "root" : dirName; // Close enough

    const newContent = content.replace(IMPORT_REGEX, (match, keyword, relNode, importedPath) => {
      let importedName = basename(importedPath);
      if (!importedName.includes(".")) importedName += ".ts";

      const tLayer = fileMap.get(importedName);
      if (!tLayer) return match;

      let newRel = "";
      if (dirName === "tests") {
        if (tLayer === "tests") newRel = `./${importedName}`;
        else if (tLayer === "root") newRel = `../${importedName}`;
        else newRel = `../${tLayer}/mod.ts`;
      } else if (dirName === "root" || dirName === ".") {
        if (tLayer === "root") newRel = `./${importedName}`;
        else newRel = `./${tLayer}/mod.ts`; 
      } else {
        // Source is in a layer 00-06
        if (tLayer === "root") newRel = `../${importedName}`;
        else if (tLayer === dirName) newRel = `./${importedName}`;
        else newRel = `../${tLayer}/mod.ts`;
      }

      // Avoid self-referencing inside mod.ts
      if (entry.name === "mod.ts" && newRel === `./mod.ts`) return match;

      const rep = `${keyword} "${newRel}"`;
      if (match !== rep) edited = true;
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
  
  // also do root level ts files
  for await (const entry of Deno.readDir(".")) {
    if (entry.isFile && entry.name.endsWith(".ts")) {
      const content = await Deno.readTextFile(entry.name);
      let edited = false;
      const newContent = content.replace(IMPORT_REGEX, (match, keyword, relNode, importedPath) => {
        let importedName = basename(importedPath);
        if (!importedName.includes(".")) importedName += ".ts";
        const tLayer = fileMap.get(importedName);
        if (!tLayer) return match;
        
        let newRel = "";
        if (tLayer === "root") newRel = `./${importedName}`;
        else newRel = `./${tLayer}/mod.ts`;
        
        const rep = `${keyword} "${newRel}"`;
        if (match !== rep) edited = true;
        return rep;
      });
      if (edited) {
        await Deno.writeTextFile(entry.name, newContent);
        totalFixed++;
      }
    }
  }
  console.log(`v3 rewriter fixed ${totalFixed} files.`);
}
main();
