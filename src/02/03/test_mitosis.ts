import { MX } from "@generated";
import { ISA, LAMBDA_VM } from "@generated";

console.log("🧬 [TEST] Initializing Mitosis Verification...");

// 1. Setup Parent Atom (Index 1)
MX.clear();
const parentId = 0x1234567812345678n;
MX.setId(1, parentId);
MX.setEnergy(1, 200); // 200 Energy (> 150 required)
MX.setResonance(1, 100);
MX.roles[1] = 2; // Constructor
MX.semanticBonuses[1] = 5; // Cognitive Bonus

const parentLogic = new Uint8Array([
  0x11,
  0x22,
  0x33,
  0x44,
  0x55,
  0x66,
  0x77,
  0x88,
]);
MX.setLogic(1, parentLogic);

const parentInstructions = new Uint32Array(16);
parentInstructions[0] = ISA.SELF_REP | (0xDE << 8) | (0xAD << 16) |
  (0xBE << 24); // SELF_REP + Epigenetic payload
MX.setCode(1, parentInstructions);

const context = new Uint8Array(32);

// 2. Execute lambda VM to get intent
const vmState = {
  x: 0,
  y: 0,
  nutrients: new Int32Array(1),
  marketPool: new Int32Array(1),
  energy: 200,
  resonance: 100,
  bonds: new Uint32Array(4),
};

const result = LAMBDA_VM.execute(
  parentLogic,
  parentInstructions,
  context,
  vmState,
);

// 3. Verify SELF_REP emitted the correct intent
const spawnIntent = result.intent.find((i) =>
  i.level === 10 && i.value === "spawn"
);
if (!spawnIntent) {
  console.error("❌ [TEST] LAMBDA_VM did not emit 'spawn' intent.");
  Deno.exit(1);
}
console.log("✅ [TEST] VM successfully emitted 'spawn' intent.");

// 4. Simulate PULSE_WORKER translating intent to spawn request
MX.requestSpawn(1);

// 5. Simulate PULSE main thread handling mitosis
const activeIndices = [1];
let newIdxGenerated = -1;

for (const idx of activeIndices) {
  if (MX.hasSpawnRequest(idx)) {
    MX.clearSpawn(idx);
    const newIdx = MX.findEmptySlot();
    if (newIdx !== -1) {
      newIdxGenerated = newIdx;

      // Division of Capital
      const childEnergy = MX.getEnergy(idx) / 2;
      const childResonance = MX.getResonance(idx) / 2;

      MX.setEnergy(idx, childEnergy);
      MX.setResonance(idx, childResonance);
      MX.setEnergy(newIdx, childEnergy);
      MX.setResonance(newIdx, childResonance);

      // Epigenetic Heredity
      MX.setLogic(newIdx, MX.getLogic(idx));
      MX.setCode(newIdx, MX.getCode(idx));

      MX.roles[newIdx] = MX.roles[idx];
      MX.semanticBonuses[newIdx] = MX.semanticBonuses[idx];

      const childId = BigInt(
        `0x${MX.getId(idx).toString(16).substring(0, 8)}00000001`,
      );
      MX.setId(newIdx, childId);
    }
  }
}

// 6. Assertions
if (newIdxGenerated === -1) {
  console.error("❌ [TEST] Failed to instantiate child atom.");
  Deno.exit(1);
}

const childLogic = MX.getLogic(newIdxGenerated);
const childCode = MX.getCode(newIdxGenerated);

if (
  MX.getEnergy(1) !== 100 ||
  MX.getEnergy(newIdxGenerated) !== 100
) {
  console.error(
    "❌ [TEST] Energy not split evenly: Parent=",
    MX.getEnergy(1),
    "Child=",
    MX.getEnergy(newIdxGenerated),
  );
  Deno.exit(1);
}

if (childLogic[0] !== 0x11 || (childCode[0] & 0xFF) !== ISA.SELF_REP) {
  console.error(
    "❌ [TEST] Epigenetic genetics/memory failed to inherit.",
    childLogic[0],
    childCode[0],
  );
  Deno.exit(1);
}

if (
  MX.roles[newIdxGenerated] !== 2 ||
  MX.semanticBonuses[newIdxGenerated] !== 5
) {
  console.error("❌ [TEST] Epigenetic traits failed to inherit.");
  Deno.exit(1);
}

console.log(
  `✅ [TEST] Mitosis successful! Atom 1 split into Atom ${newIdxGenerated}. Capital divided exactly 50/50. Logic, Memory, Roles, and Bonuses preserved. 🧬🌿👶`,
);
Deno.exit(0);
