import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { GATE } from "@03";
import { LAMBDA_VM } from "@02";

console.log("🤝 [TEST] Verifying Era 38: Diplomacy & Taxation...");

// 1. Setup Trusted Signature
const trustedLogic = new Uint8Array([
  0xAA,
  0xBB,
  0xCC,
  0xDD,
  0xEE,
  0xFF,
  0x11,
  0x22,
]);
const trustedHex = Array.from(trustedLogic).map((b) =>
  b.toString(16).padStart(2, "0")
).join("").toUpperCase();
GATE.trustedSignatures.add(trustedHex);

// 2. Test Diplomatic RECV
console.log("   [TEST] Case 1: Diplomatic RECV (Resonance Boost)");
const baseState = {
  x: 100,
  y: 100,
  nutrients: new Int32Array(10),
  marketPool: new Int32Array(10),
  energy: 100,
  resonance: 100,
  bonds: new Uint32Array(4),
  incomingMessage: 42,
  isDiplomatic: true,
};

const receiverLogic = new Uint8Array(8);
const receiverCode = new Uint32Array(16);
// ISA.RECV = 0x61. Encoding is Little Endian: [op(8) | p1(8) | p2(8) | p3(8)]
receiverCode[0] = 0x61 | (0 << 8); // RECV r0

const resDiplomatic = LAMBDA_VM.execute(
  receiverLogic,
  receiverCode,
  new Uint8Array(32),
  baseState as any,
);
console.log(
  `   [TEST] Diplomatic Resonance Delta: ${resDiplomatic.resonanceDelta} (Target: 2.0)`,
);

const resNormal = LAMBDA_VM.execute(
  receiverLogic,
  receiverCode,
  new Uint8Array(32),
  { ...baseState, isDiplomatic: false } as any,
);
console.log(
  `   [TEST] Normal Resonance Delta: ${resNormal.resonanceDelta} (Target: 0.2)`,
);

if (resDiplomatic.resonanceDelta === 2.0 && resNormal.resonanceDelta === 0.2) {
  console.log("✅ [TEST] Diplomacy verified.");
} else {
  console.log("❌ [TEST] Diplomacy mismatch.");
  Deno.exit(1);
}

// 3. Test Metabolic Taxation
console.log("   [TEST] Case 2: Metabolic Taxation (Cognitive Load)");
const taxedState = {
  ...baseState,
  isDiplomatic: false,
  semanticBonuses: 1, // "Swift" active
};
const resTaxed = LAMBDA_VM.execute(
  receiverLogic,
  new Uint32Array(16),
  new Uint8Array(32),
  taxedState as any,
);
console.log(
  `   [TEST] Taxed Energy Delta: ${
    resTaxed.energyDelta.toFixed(2)
  } (Target: -0.05)`,
);

const resFree = LAMBDA_VM.execute(
  receiverLogic,
  new Uint32Array(16),
  new Uint8Array(32),
  { ...taxedState, semanticBonuses: 0 } as any,
);
console.log(`   [TEST] Free Energy Delta: ${resFree.energyDelta} (Target: 0)`);

if (resTaxed.energyDelta === -0.05 && resFree.energyDelta === 0) {
  console.log("✅ [TEST] Taxation verified.");
} else {
  console.log("❌ [TEST] Taxation mismatch.");
  Deno.exit(1);
}

console.log("✅ [TEST] ERA 38 CORE SYSTEMS FUNCTIONAL.");
Deno.exit(0);
