import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";

const targets = {
  "00_substrate": ["memory", "layout", "offset", "wasm", "state_matrix", "baseline", "alloc", "budget"],
  "01_physics": ["spatial", "structure", "collision", "glyph", "vector10", "oscillator", "topology", "physics", "matrix_engine"],
  "02_metabolism": ["pulse", "worker", "metabolism", "replication", "mitosis", "meiosis", "energy", "spawn", "resilience", "trend", "soak", "snap", "rehydration", "ribosome", "lambda", "vm", "opcode", "syscall"],
  "03_governance": ["ledger", "guard", "policy", "pressure", "ring", "contract", "governance", "reduction", "telemetry"],
  "04_noosphere": ["p2p", "federation", "network", "transport", "spore", "webrtc", "sync", "ingress"],
  "05_exocortex": ["oracle", "semantic", "llm", "cognition", "neural", "neuro", "plasmid", "prediction", "market"],
  "06_akasha": ["ui", "codex", "observer", "dashboard", "narrative", "human_channel"],
  "63_necropolis": ["nightly", "necropolis", "decay", "ruin", "fossil", "archived"]
};

const decoder = new TextDecoder();

async function gitMv(src: string, dest: string) {
  const p = new Deno.Command("git", { args: ["mv", src, dest] });
  const { code, stderr } = await p.output();
  if (code !== 0) {
    console.error(`Failed to move ${src} -> ${dest}: ${decoder.decode(stderr)}`);
  } else {
    console.log(`Moved: ${src} -> ${dest}`);
  }
}

async function moveFile(src: string, dest: string) {
  const p = new Deno.Command("git", { args: ["mv", src, dest] });
  const { code } = await p.output();
  if (code !== 0) {
     Deno.renameSync(src, dest);
  }
}

function matchLayer(filename: string, content: string): string {
  const lower = filename.toLowerCase();
  
  // Specific mappings first
  if (lower.includes("ui") || lower.includes("dashboard")) return "06_akasha";
  if (lower.includes("oracle") || lower.includes("llm") || lower.includes("semantic")) return "05_exocortex";
  if (lower.includes("p2p") || lower.includes("webrtc") || lower.includes("network")) return "04_noosphere";
  if (lower.includes("ledger") || lower.includes("policy") || lower.includes("reduction") || lower.includes("contract")) return "03_governance";
  if (lower.includes("worker") || lower.includes("pulse") || lower.includes("spawn") || lower.includes("metabolism") || lower.includes("resilience")) return "02_metabolism";
  if (lower.includes("spatial") || lower.includes("structure") || lower.includes("glyph")) return "01_physics";
  if (lower.includes("memory") || lower.includes("wasm") || lower.includes("offset") || lower.includes("state_matrix")) return "00_substrate";

  // Scan file contents for layer strings
  if (content.includes("06_akasha")) return "06_akasha";
  if (content.includes("05_exocortex")) return "05_exocortex";
  if (content.includes("04_noosphere")) return "04_noosphere";
  if (content.includes("03_governance")) return "03_governance";
  if (content.includes("02_metabolism")) return "02_metabolism";
  if (content.includes("01_physics")) return "01_physics";
  
  return "00_substrate"; // default
}

async function main() {
  const testDir = "tests";
  
  for await (const entry of Deno.readDir(testDir)) {
    if (entry.isFile && entry.name.endsWith(".ts")) {
      const src = join(testDir, entry.name);
      const content = await Deno.readTextFile(src);
      const layer = matchLayer(entry.name, content);
      
      const destDir = join(layer, "03_tests");
      await ensureDir(destDir);
      
      const dest = join(destDir, entry.name);
      await gitMv(src, dest);
    }
  }

  // Move remaining worker tools to 02_metabolism/03_tests
  for await (const entry of Deno.readDir(".")) {
      if (entry.isFile && entry.name.startsWith("worker_") && entry.name.endsWith(".ts")) {
          await gitMv(entry.name, join("02_metabolism/03_tests", entry.name));
      }
      if (entry.isFile && entry.name === "worker_test.js") {
          await gitMv(entry.name, join("02_metabolism/03_tests", entry.name));
      }
  }
}

main();
