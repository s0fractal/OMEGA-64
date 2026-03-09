import * as fs from "node:fs";

let text = fs.readFileSync("CORE_ARCH_MANIFEST.json", "utf8");
text = text.replace(/\s*"DAEMON_PHEROMONE_LEDGER_PERSISTENCE\.ts",\n/, "");
text = text.replace(/\s*"DAEMON_PHEROMONE_LEDGER_RUNTIME\.ts",\n/, "");
text = text.replace(/\s*"DAEMON_PLASMID_LEDGER_PERSISTENCE\.ts",\n/, "");
text = text.replace(/\s*"DAEMON_PLASMID_LEDGER_RUNTIME\.ts",\n/, "");
fs.writeFileSync("CORE_ARCH_MANIFEST.json", text);
console.log("manifest fixed");
