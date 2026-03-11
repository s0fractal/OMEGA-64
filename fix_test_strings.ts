import { walk } from "jsr:@std/fs";
import { basename } from "jsr:@std/path";

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

const root_files = ["SYSTEM_START.ts", "PULSE.ts", "PULSE_WORKER.ts", "AKASHA_SERVER.ts", "OMEGA_DAEMON.ts", "MUTATION_TELEMETRY.ts", "TUI_DASHBOARD.ts", "AGENT_PROXY.ts", "llm_soul.ts", "nightly_soak.ts", "build_wasm.ts"];
for (const r of root_files) fileMap.set(r, "root");

async function main() {
  let count = 0;
  for await (const entry of walk("tests", { exts: [".ts"] })) {
    const original = await Deno.readTextFile(entry.path);
    let content = original;
    
    // For each core file, if it exists as a bare string "FILENAME.ts" or 'FILENAME.ts' or `FILENAME.ts`,
    // replace it with "layer/FILENAME.ts".
    for (const [filename, layer] of fileMap.entries()) {
      if (layer === "root" || layer === "tests") {
        continue;
      }
      
      const newPath = `${layer}/${filename}`;
      
      // regex to match EXACTLY "FILENAME.ts", ignoring if it already has a slash
      // e.g. "PULSE.ts" -> "02_metabolism/PULSE.ts"
      const r1 = new RegExp(`(["'\`])${filename}(["'\`])`, "g");
      content = content.replace(r1, `$1${newPath}$2`);
    }

    if (content !== original) {
      await Deno.writeTextFile(entry.path, content);
      count++;
      console.log(`Updated string literals in ${entry.path}`);
    }
  }
  console.log(`Fixed ${count} tests for string literals.`);
}

main();
