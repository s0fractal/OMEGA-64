import { ISA, LAMBDA_VM } from "./LAMBDA_VM.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";

console.log("🧠 [TEST] Verifying Era 36: Cognitive Scaffolding...");

const mockNutrients = new Int32Array(70 * 40);
const mockMarketPool = new Int32Array(1);
const mockBonds = new Uint32Array(4);

// 1. Verify "Swift" bonus (Free MOVE)
console.log("   [TEST] Case 1: 'Swift' Thought Actuator");
const swiftThought = "I am a swift glider of the void.";
const swiftBonuses = SEMANTIC_MEMBRANE.getBonuses(swiftThought);

const swiftCode = new Uint32Array(16);
swiftCode[0] = ISA.MOVE | (128 << 8) | (128 << 16); // MOVE (0,0)

const swiftState = {
  x: 700,
  y: 400,
  nutrients: mockNutrients,
  marketPool: mockMarketPool,
  energy: 100,
  resonance: 100,
  bonds: mockBonds,
  semanticBonuses: swiftBonuses,
};
const swiftContext = new Uint8Array(32);

const result1 = LAMBDA_VM.execute(
  new Uint8Array(8),
  swiftCode,
  swiftContext,
  swiftState,
);
console.log(
  `   [TEST] Energy Delta with 'Swift' (should be 0): ${result1.energyDelta}`,
);

if (result1.energyDelta !== 0) {
  console.log("❌ [TEST] FAILURE: Swift bonus not applied.");
  Deno.exit(1);
}

// 2. Verify "Guardian" bonus (Cheap BUILD)
console.log("   [TEST] Case 2: 'Guardian' Thought Actuator");
const guardianThought = "I am the guardian of the crystal shield.";
const guardianBonuses = SEMANTIC_MEMBRANE.getBonuses(guardianThought);

const guardianCode = new Uint32Array(16);
guardianCode[0] = ISA.BUILD | (1 << 8) | (100 << 16); // BUILD type 1, density 100

const guardianState = {
  x: 700,
  y: 400,
  nutrients: mockNutrients,
  marketPool: mockMarketPool,
  energy: 100,
  resonance: 100,
  bonds: mockBonds,
  semanticBonuses: guardianBonuses,
};
const guardianContext = new Uint8Array(32);

const result2 = LAMBDA_VM.execute(
  new Uint8Array(8),
  guardianCode,
  guardianContext,
  guardianState,
);
console.log(
  `   [TEST] Resonance Delta with 'Guardian' (should be -10): ${result2.resonanceDelta}`,
);

if (result2.resonanceDelta !== -10) {
  console.log("❌ [TEST] FAILURE: Guardian bonus not applied.");
  Deno.exit(1);
}

// 3. Verify No Bonus (Normal cost)
console.log("   [TEST] Case 3: Standard behavior (No Actuator)");
const normalState = { ...swiftState, semanticBonuses: 0 };
swiftContext[0] = 0; // Reset PC
const result3 = LAMBDA_VM.execute(
  new Uint8Array(8),
  swiftCode,
  swiftContext,
  normalState,
);
console.log(
  `   [TEST] Energy Delta without bonus (should be -1): ${result3.energyDelta}`,
);

if (result3.energyDelta !== -1) {
  console.log("❌ [TEST] FAILURE: Normal cost not applied.");
  Deno.exit(1);
}

console.log("✅ [TEST] SUCCESS: Cognitive Scaffolding active.");
Deno.exit(0);
