import { STATE_MATRIX } from "../../00_substrate/mod.ts";
import { PHYSICS_ENGINE } from "../../01_physics/mod.ts";
import { AUDIT_ENGINE } from "../mod.ts";

console.log("🏺 [TEST] Verifying Era 34: Digital Archaeology...");

// 1. Verify Memory Leaking
console.log("   [TEST] Case 1: Memory Leaking from structural ruins");
const gridIdx = 100; // Sample grid cell
// @ts-ignore
const structureGrid = STATE_MATRIX.structureGrid;
// @ts-ignore
const memoryGrid = STATE_MATRIX.memoryGrid;
// @ts-ignore
const viralGrid = STATE_MATRIX.viralGrid;

// Setup a decaying structure with density 30 (Ruins) and some bytecode
const testLogic = new Uint8Array([
  0xAA,
  0xBB,
  0xCC,
  0xDD,
  0xEE,
  0xFF,
  0x11,
  0x22,
]);
structureGrid[gridIdx] = (30 << 8) | 1; // Density 30, Type 1
for (let b = 0; b < 8; b++) memoryGrid[gridIdx * 8 + b] = testLogic[b];

// Run one pass of decayStructures
PHYSICS_ENGINE.decayStructures(structureGrid, memoryGrid, viralGrid);

// Check if viralGrid contains the leaked logic
const viralIdx = gridIdx * 9;
const leakedIntensity = Atomics.load(viralGrid, viralIdx + 8);
let logicMatches = true;
for (let b = 0; b < 8; b++) {
  if (Atomics.load(viralGrid, viralIdx + b) !== testLogic[b]) {
    logicMatches = false;
  }
}

console.log(
  `   [TEST] Leaked Intensity: ${leakedIntensity} (Target: ${50 - 29})`,
); // decay reduces 30 to 29
if (leakedIntensity > 0 && logicMatches) {
  console.log("✅ [TEST] SUCCESS: Memory Leaking active.");
} else {
  console.log("❌ [TEST] FAILURE: Memory not leaked correctly.");
  Deno.exit(1);
}

// 2. Verify Audit Engine (Archival Scan)
console.log("   [TEST] Case 2: Archival Audit Scanner");
// We can't easily mock LLM, but we can check if it extracts thoughts from .md files.
// Let's create a temporary .md file
const testFileName = "test_archived_atom.md";
const testThought = "I AM THE ANCIENT GHOST OF THE MACHINE";
await Deno.writeTextFile(testFileName, `---\nthought: '${testThought}'\n---`);

const thoughts = await AUDIT_ENGINE.auditMemories();
console.log(`   [TEST] Found archived thoughts: ${thoughts.length}`);

// Clean up
await Deno.remove(testFileName);

if (thoughts.includes(testThought)) {
  console.log("✅ [TEST] SUCCESS: Audit Engine extracted archived intent.");
} else {
  console.log("❌ [TEST] FAILURE: Audit Engine missed the test thought.");
  Deno.exit(1);
}

console.log("✅ [TEST] ALL ARCHAEOLOGICAL SYSTEMS GO.");
Deno.exit(0);
