/**
 * test_hormone_species_evolution_contract.ts
 * Stage 7.4 Verification: Hormone-Driven Species Evolution
 *
 * Verifies that:
 * 1. LLM_SYNAPSE.generateSpeciesTaxonomy is called with hormoneRegime.
 * 2. fallbackTaxonomy uses different Genus lists based on hormone regime.
 * 3. discoverSpecies enqueues chronicles mentioning the hormone regime.
 */

import { STATE_MATRIX } from "../../00_substrate/mod.ts";
import { AKASHA_CODEX } from "../../06_akasha/mod.ts";
import { LLM_SYNAPSE } from "../../05_exocortex/mod.ts";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS | ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL | ${label}`);
    failed++;
  }
}

// ── Mocking ──────────────────────────────────────────────────────────────────

let lastLlmInput: any = null;
const originalGenerate = LLM_SYNAPSE.generateSpeciesTaxonomy;

LLM_SYNAPSE.generateSpeciesTaxonomy = async (input: any) => {
  lastLlmInput = input;
  // Return a valid taxonomy so we don't always trigger fallback in discoverSpecies
  return Promise.resolve({
    latinName: "Testis Species",
    behavior: `Behavior in ${input.hormoneRegime}`,
    philosophy: "Philosophy of testing",
  });
};

// ── Tests ────────────────────────────────────────────────────────────────────

console.log("\n🧪 [HORMONE SPECIES EVOLUTION CONTRACT] Starting...\n");

try {
  // 1. Verify LLM Input Context
  console.log("── Section 1: LLM Input Context ──");

  // Set hormone to aggressive_bloom
  STATE_MATRIX.setHormone(2, 2000); // agression
  STATE_MATRIX.setHormone(0, 0); // reset entropy

  // We need to trigger discoverSpecies. We'll pass a dummy GenomeStats.
  const dummyStat = {
    genome: "AABBCCDD11223344556677889900AABB",
    count: 100,
    share: 0.1,
    sampleIndices: [0],
  };

  // Need to make sure the species index is empty for this genome
  // Since AKASHA_CODEX is a singleton, we might need a way to clear it or use a unique genome.
  const uniqueGenome = "FF" + Date.now().toString(16).padStart(30, "0");
  dummyStat.genome = uniqueGenome;

  await (AKASHA_CODEX as any)._discoverSpecies(1000, dummyStat, 5);

  assert(lastLlmInput !== null, "LLM generateSpeciesTaxonomy was called");
  assert(
    lastLlmInput.hormoneRegime === "aggressive_bloom",
    `Passed correct regime to LLM: ${lastLlmInput.hormoneRegime}`,
  );

  // 2. Verify Fallback Taxonomy Logic
  console.log("\n── Section 2: Fallback Taxonomy Logic ──");

  // access fallbackTaxonomy via any or exported (it's const in file, so might not be exported)
  // Actually it's NOT exported. I should have made it exported if I wanted to test it directly.
  // I will test it indirectly via the discovered species entry in the index if I bypass LLM.

  LLM_SYNAPSE.generateSpeciesTaxonomy = () =>
    Promise.reject(new Error("LLM Fail"));

  const aggressiveGenome = "AA" + Date.now().toString(16).padStart(30, "0");
  const aggrStat = { ...dummyStat, genome: aggressiveGenome };

  await (AKASHA_CODEX as any)._discoverSpecies(2000, aggrStat, 10);

  const aggrEntry = (AKASHA_CODEX as any)._getSpeciesIndex().find((e: any) =>
    e.genome === aggressiveGenome
  );
  assert(aggrEntry !== undefined, "Aggressive species entry created");
  // Genus for aggressive_bloom: ["Agressor", "Praedo", "Bellum"]
  const aggrGenus = aggrEntry.latinName.split(" ")[0];
  assert(
    ["Agressor", "Praedo", "Bellum"].includes(aggrGenus),
    `Aggressive regime uses correct genus: ${aggrGenus}`,
  );

  // Set hormone to repair_surge
  STATE_MATRIX.setHormone(2, 0); // reset aggression
  STATE_MATRIX.setHormone(4, 2000); // repair_drive

  const repairGenome = "BB" + Date.now().toString(16).padStart(30, "0");
  const repairStat = { ...dummyStat, genome: repairGenome };

  await (AKASHA_CODEX as any)._discoverSpecies(3000, repairStat, 10);

  const repairEntry = (AKASHA_CODEX as any)._getSpeciesIndex().find((e: any) =>
    e.genome === repairGenome
  );
  // Genus for repair_surge: ["Sano", "Medicus", "Regen"]
  const repairGenus = repairEntry.latinName.split(" ")[0];
  assert(
    ["Sano", "Medicus", "Regen"].includes(repairGenus),
    `Repair regime uses correct genus: ${repairGenus}`,
  );

  // 3. Verify Chronicles
  console.log("\n── Section 3: Chronicles ──");
  // The latest chronicle should mention the regime.
  const latestChronicle = (AKASHA_CODEX as any)._getChronicleIndex()[0];
  assert(latestChronicle !== undefined, "Chronicle entry exists");
  assert(
    latestChronicle.type === "species_discovery",
    "Latest chronicle is species_discovery",
  );
  assert(
    latestChronicle.title.includes("(Repair Surge)"),
    `Chronicle title mentions regime: ${latestChronicle.title}`,
  );
  assert(
    latestChronicle.body.includes("Repair Surge conditions"),
    "Chronicle body mentions context",
  );
} catch (err) {
  console.error("Test execution failed:", err);
  failed++;
} finally {
  // Restore
  LLM_SYNAPSE.generateSpeciesTaxonomy = originalGenerate;
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(
  `🧪 HORMONE SPECIES EVOLUTION CONTRACT: ${
    failed === 0 ? "✅ PASS" : "❌ FAIL"
  } (${passed}/${passed + failed})`,
);

if (failed > 0) {
  Deno.exit(1);
}
