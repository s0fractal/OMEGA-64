import * as fs from "node:fs";

let text = fs.readFileSync("CORE_ARCH_MANIFEST.json", "utf8");

// Remove all 10 files! 
const filesToRemove = [
  "DAEMON_PHEROMONE_LEDGER_PERSISTENCE.ts",
  "DAEMON_PHEROMONE_LEDGER_RUNTIME.ts",
  "DAEMON_PLASMID_LEDGER_PERSISTENCE.ts",
  "DAEMON_PLASMID_LEDGER_RUNTIME.ts",
  "HOMEOSTASIS_TARGET_LEDGER_PERSISTENCE.ts",
  "HOMEOSTASIS_TARGET_LEDGER_RUNTIME.ts",
  "PRESSURE_RING_SCALE_LEDGER_PERSISTENCE.ts",
  "PRESSURE_RING_SCALE_LEDGER_RUNTIME.ts",
  "GENETIC_LEDGER_PERSISTENCE.ts",
  "GENETIC_LEDGER_RUNTIME.ts"
];

for (const file of filesToRemove) {
  const regex = new RegExp(`\\s*"${file.replace(/\./g, '\\.')}",?\\n`, 'g');
  text = text.replace(regex, "\n");
}

// Ensure array trailing comma fixing if needed, but standard JSON usually doesn't have it on the last element unless someone broke it.
fs.writeFileSync("CORE_ARCH_MANIFEST.json", text);
console.log("manifest fixed");
