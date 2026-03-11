import { join } from "node:path";

const MANIFEST_PATH = "CORE_ARCH_MANIFEST.json";

const raw = await Deno.readTextFile(MANIFEST_PATH);
const manifest = JSON.parse(raw);

const explicitFiles = new Set<string>();
for (const key of Object.keys(manifest)) {
  if (Array.isArray(manifest[key])) {
    for (const file of manifest[key]) {
      explicitFiles.add(file);
    }
  }
}

const cmd = new Deno.Command("git", { args: ["ls-files"] });
const { stdout } = await cmd.output();
const allTracked = new TextDecoder().decode(stdout).split("\n").filter(Boolean);

const orphans = [];
for (const file of allTracked) {
  if (explicitFiles.has(file)) continue;
  
  if (file === "OMEGA_CORE_LOGIC.md" || file === "export_core.ts" || file === "dump_waste.ts" || file === "generate_orphans.ts") continue;
  if (file.startsWith(".")) continue;
  if (file.startsWith("tests/") || file.match(/^test_.*\.ts$/)) continue; // ignore test files
  if (file.startsWith("sigma_core/") || file.startsWith("omega_vm/") || file.startsWith("omega_wasm/") || file.startsWith("target/")) continue; // ignore rust logic
  if (file === "LICENSE" || file.endsWith(".lock") || file.endsWith(".json") || file.endsWith(".jsonc") || file.endsWith(".toml") || file.endsWith(".yaml")) continue;
  if (file.endsWith(".log") || file.includes("logs/")) continue;
  if (file.endsWith(".webp") || file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".ico") || file.endsWith(".wasm") || file.endsWith(".html") || file.endsWith(".css")) continue;
  if (file.endsWith(".csv")) continue;
  
  orphans.push(file);
}

let md = "# FORGOTTEN & UNTRACKED RESOURCES\n\n";
md += "The following files are tracked in the OMEGA-64 repository but are **NOT** explicitly listed in the `CORE_ARCH_MANIFEST.json` arrays. This makes them 'orphans', legacy scripts, scratchpads, forgotten docs, or auxiliary tools.\n\n";

let dumpedCount = 0;
for (const f of orphans) {
  try {
    const content = await Deno.readTextFile(f);
    let lang = "text";
    if (f.endsWith(".ts") || f.endsWith(".js")) lang = "typescript";
    else if (f.endsWith(".md")) lang = "markdown";
    else if (f.endsWith(".rs")) lang = "rust";
    
    md += `## FILE: ${f}\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n\n`;
    dumpedCount++;
  } catch (err) {
    // Might be binary or unreadable
  }
}

await Deno.writeTextFile("ORPHANED_WASTE.md", md);
console.log(`Generated ORPHANED_WASTE.md with ${dumpedCount} files.`);
