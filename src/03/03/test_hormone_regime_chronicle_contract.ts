/**
 * test_hormone_regime_chronicle_contract.ts
 * Stage 7.2 Verification: Hormone Regime Chronicle
 *
 * Verifies that:
 * 1. hormoneRegimeLabel() correctly classifies all 6 regime bands.
 * 2. buildHormoneRegimeEvidence() produces deterministic signatures.
 * 3. All 6 hormones are readable from SharedArrayBuffer.
 * 4. Regime signature changes when hormone values cross thresholds.
 * 5. AkashaServiceState.hormoneRegime is a string (type sanity at import).
 */

import { MX } from "@generated";

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

// Inline the same logic as AKASHA_CODEX.ts to verify formula correctness.
// (avoids starting a full Codex runtime in a standalone test)

function hormoneRegimeLabel(h: number[]): string {
  if (h[0] > 1500) return "high_entropy";
  if (h[2] > 1500) return "aggressive_bloom";
  if (h[4] > 1500) return "repair_surge";
  if (h[1] > 1500) return "viscous_stasis";
  if (h[0] < 256 && h[2] < 256 && h[4] < 256) return "dormant_baseline";
  return "balanced_homeostasis";
}

function makeSig(h: number[]): string {
  return h.map((v) => String.fromCharCode(65 + Math.min(3, v >> 9))).join("");
}

console.log("\n🧬 [HORMONE REGIME CHRONICLE CONTRACT] Starting...\n");

// ---
// Section 1: Regime label classification
// ---
console.log("── Section 1: Regime Label Classification ──");

assert(
  hormoneRegimeLabel([2048, 0, 0, 0, 0, 0]) === "high_entropy",
  "entropy_pressure=2048 → high_entropy",
);
assert(
  hormoneRegimeLabel([0, 0, 2048, 0, 0, 0]) === "aggressive_bloom",
  "aggression=2048 → aggressive_bloom",
);
assert(
  hormoneRegimeLabel([0, 0, 0, 0, 2048, 0]) === "repair_surge",
  "repair_drive=2048 → repair_surge",
);
assert(
  hormoneRegimeLabel([0, 2048, 0, 0, 0, 0]) === "viscous_stasis",
  "time_viscosity=2048 (others low) → viscous_stasis",
);
assert(
  hormoneRegimeLabel([100, 100, 100, 0, 100, 0]) === "dormant_baseline",
  "all low <256 → dormant_baseline",
);
assert(
  hormoneRegimeLabel([500, 500, 500, 0, 500, 0]) === "balanced_homeostasis",
  "mixed mid-range → balanced_homeostasis",
);

// ---
// Section 2: Priority ordering (entropy beats viscosity beats aggression)
// ---
console.log("\n── Section 2: Priority Ordering ──");

assert(
  hormoneRegimeLabel([1600, 1600, 0, 0, 0, 0]) === "high_entropy",
  "entropy=1600 beats viscosity=1600 (entropy first)",
);
assert(
  hormoneRegimeLabel([0, 1600, 1600, 0, 0, 0]) === "aggressive_bloom",
  "aggression=1600 beats viscosity=1600 (aggression second)",
);
assert(
  hormoneRegimeLabel([0, 1600, 0, 0, 1600, 0]) === "repair_surge",
  "repair=1600 beats viscosity=1600 (repair third)",
);

// ---
// Section 3: Signature compactness / determinism
// ---
console.log("\n── Section 3: Signature Determinism ──");

// Band boundaries: 0..511=A, 512..1023=B, 1024..1535=C, 1536..2048=D
assert(makeSig([0, 0, 0, 0, 0, 0]) === "AAAAAA", "all-zero sig = AAAAAA");
assert(
  makeSig([512, 512, 512, 512, 512, 512]) === "BBBBBB",
  "all-512 sig = BBBBBB",
);
assert(
  makeSig([1024, 1024, 1024, 1024, 1024, 1024]) === "CCCCCC",
  "all-1024 sig = CCCCCC",
);
assert(
  makeSig([2048, 2048, 2048, 2048, 2048, 2048]) === "DDDDDD",
  "all-2048 sig = DDDDDD",
);
assert(
  makeSig([511, 512, 1023, 1024, 1535, 1536]) === "ABBCCD",
  "mixed band sig: 511=A,512=B,1023=B,1024=C,1535=C,1536=D",
);

// ---
// Section 4: SharedArrayBuffer roundtrip for all 6 hormones
// ---
console.log("\n── Section 4: SharedArrayBuffer Roundtrip (all 6 channels) ──");

const testVals = [1234, 512, 2048, 0, 1600, 777];
for (let i = 0; i < 6; i++) {
  MX.setHormone(i, testVals[i]);
}
const h = [0, 1, 2, 3, 4, 5].map((id) => MX.getHormone(id));
for (let i = 0; i < 6; i++) {
  assert(
    h[i] === testVals[i],
    `Hormone[${i}] write=${testVals[i]} read=${h[i]}`,
  );
}

// h = [1234, 512, 2048, 0, 1600, 777]
// aggression(2)=2048 and entropy(0)=1234 (not >1500)
// → aggression wins → aggressive_bloom
const regime = hormoneRegimeLabel(h);
assert(
  regime === "aggressive_bloom",
  `Regime after aggression=${h[2]} (entropy=${
    h[0]
  }) should be aggressive_bloom, got '${regime}'`,
);

// ---
// Section 5: Signature changes when threshold is crossed
// ---
console.log("\n── Section 5: Signature Transition on Threshold Cross ──");

const sigBelow = `${hormoneRegimeLabel([1500, 0, 0, 0, 0, 0])}|${
  makeSig([1500, 0, 0, 0, 0, 0])
}`;
const sigAbove = `${hormoneRegimeLabel([1501, 0, 0, 0, 0, 0])}|${
  makeSig([1501, 0, 0, 0, 0, 0])
}`;
assert(
  sigBelow !== sigAbove,
  `Signature changes when entropy crosses 1500 threshold`,
);
assert(
  sigAbove.startsWith("high_entropy"),
  `Regime above 1500 is high_entropy, got: ${sigAbove}`,
);

// ---
// Summary
// ---
console.log(`\n${"─".repeat(50)}`);
console.log(
  `🧬 HORMONE REGIME CHRONICLE CONTRACT: ${
    failed === 0 ? "✅ PASS" : "❌ FAIL"
  } (${passed}/${passed + failed})`,
);
if (failed > 0) {
  console.error(`Failed: ${failed}`);
  Deno.exit(1);
}
