const ROOT = new URL("..", import.meta.url);

const ALLOWLIST = new Set([
  // Canon sectors
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  // Canon tooling
  "e",
  "o",
  "archive",
  "tests",
  // Governance & canon docs
  "AGENTS.md",
  "README.md",
  "I.sigma.md",
  "OMEGA_GEOMETRY.md",
  "OMEGA_MANIFEST.md",
  "OMEGA_SIGNAL.md",
  "OMEGA_SWARM.json",
  "OMEGA_LEDGER.jsonl",
  "OMEGA_LEDGER.jsonl.proposal_envelope_index.jsonl",
  "GLIDER_BREATHE_STATE.json",
  "I.I",
  "omega.schema.json",
  "signal.json",
  "sophia.proofs",
  // Runtime/config
  "deno.jsonc",
  "deno.lock",
  "mod.ts",
]);

const unexpected: string[] = [];
for await (const entry of Deno.readDir(ROOT)) {
  if (entry.name.startsWith(".")) continue;
  if (ALLOWLIST.has(entry.name)) continue;
  unexpected.push(entry.name);
}

if (unexpected.length === 0) {
  console.log("ROOT_CANON_OK");
  Deno.exit(0);
}

console.error("ROOT_CANON_VIOLATION");
for (const name of unexpected.sort()) {
  console.error(`- ${name}`);
}
Deno.exit(1);
