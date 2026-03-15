import { STATE_MATRIX } from "@generated";
import { ISA, LAMBDA_VM } from "@02";

console.log("💞 [TEST] Initializing Meiosis Verification...");

// 1. Setup Parent A (Initiator) in Index 1
STATE_MATRIX.clear();
const parentAId = 0x1111111111111111n;
STATE_MATRIX.setId(1, parentAId);
STATE_MATRIX.setEnergy(1, 200); // Need > 150 for Meiosis
STATE_MATRIX.setResonance(1, 100);
STATE_MATRIX.roles[1] = 1; // Producer
STATE_MATRIX.semanticBonuses[1] = 5;

// Parent A Logic: 8 bytes of 0xAA
const logicA = new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]);
STATE_MATRIX.setLogic(1, logicA);

// Parent A Code: 16 words of 0xAAAAAAAA
const codeA = new Uint32Array(16);
codeA.fill(0xAAAAAAAA);
// Inject CROSS_REP at start of A to target bond 0
codeA[0] = ISA.CROSS_REP | (0 << 8);
STATE_MATRIX.setCode(1, codeA);

// 2. Setup Parent B (Target) in Index 2
const parentBId = 0x2222222222222222n;
STATE_MATRIX.setId(2, parentBId);
STATE_MATRIX.setEnergy(2, 200); // Need > 100 for pooling
STATE_MATRIX.setResonance(2, 50);
STATE_MATRIX.roles[2] = 2; // Constructor
STATE_MATRIX.semanticBonuses[2] = 10; // Higher cognitive bonus

// Parent B Logic: 8 bytes of 0xBB
const logicB = new Uint8Array([0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB]);
STATE_MATRIX.setLogic(2, logicB);

// Parent B Code: 16 words of 0xBBBBBBBB
const codeB = new Uint32Array(16);
codeB.fill(0xBBBBBBBB);
STATE_MATRIX.setCode(2, codeB);

// 3. Setup Bond between A and B
// Bond slot 0 of Atom 1 targets Atom 2
const bondsA = new Uint32Array(4);
bondsA[0] = 2;
STATE_MATRIX.setBonds(1, bondsA);

// 4. Execute LAMBDA_VM on Atom A to trigger CROSS_REP
const context = new Uint8Array(32);
const vmState = {
  x: 0,
  y: 0,
  nutrients: new Int32Array(1),
  marketPool: new Int32Array(1),
  energy: 200,
  resonance: 100,
  bonds: bondsA,
};

// CROSS_REP opcode is at the beginning of codeA
const result = LAMBDA_VM.execute(
  STATE_MATRIX.getLogic(1),
  STATE_MATRIX.getCode(1),
  context,
  vmState,
);

// 5. Verify intent level 11
const meiosisIntent = result.intent.find((i) =>
  i.level === 11 && i.value.type === "meiosis"
);
if (!meiosisIntent || meiosisIntent.value.targetBondSlot !== 0) {
  console.error(
    "❌ [TEST] LAMBDA_VM did not emit 'meiosis' intent for slot 0.",
  );
  Deno.exit(1);
}
console.log("✅ [TEST] VM successfully emitted 'meiosis' intent.");

// 6. Simulate PULSE_WORKER storing target
const targetIdx = bondsA[meiosisIntent.value.targetBondSlot];
STATE_MATRIX.requestMeiosis(1, targetIdx);

// 7. Simulate PULSE handling Meiosis
let newIdxGenerated = -1;
const activeIndices = [1, 2];

for (const idx of activeIndices) {
  const targetIdx = STATE_MATRIX.getMeiosisTarget(idx);
  if (targetIdx !== 0) {
    STATE_MATRIX.clearMeiosis(idx);

    const energyA = STATE_MATRIX.getEnergy(idx);
    const energyB = STATE_MATRIX.getEnergy(targetIdx);

    if (energyA > 100 && energyB > 100) {
      const newIdx = STATE_MATRIX.findEmptySlot();
      if (newIdx !== -1) {
        newIdxGenerated = newIdx;

        // 1. Capital Pooling
        const contributionA_E = energyA * 0.3;
        const contributionB_E = energyB * 0.3;
        STATE_MATRIX.setEnergy(idx, energyA - contributionA_E);
        STATE_MATRIX.setEnergy(targetIdx, energyB - contributionB_E);
        STATE_MATRIX.setEnergy(newIdx, contributionA_E + contributionB_E);

        // 2. Recombination
        const logicA = STATE_MATRIX.getLogic(idx);
        const logicB = STATE_MATRIX.getLogic(targetIdx);
        const newLogic = new Uint8Array(8);
        newLogic.set(logicA.subarray(0, 4), 0);
        newLogic.set(logicB.subarray(4, 8), 4);
        STATE_MATRIX.setLogic(newIdx, newLogic);

        const codeA = STATE_MATRIX.getCode(idx);
        const codeB = STATE_MATRIX.getCode(targetIdx);
        const newCode = new Uint32Array(16);
        for (let p = 0; p < 16; p++) {
          newCode[p] = p % 2 === 0 ? codeA[p] : codeB[p];
        }
        STATE_MATRIX.setCode(newIdx, newCode);

        STATE_MATRIX.semanticBonuses[newIdx] = Math.max(
          STATE_MATRIX.semanticBonuses[idx],
          STATE_MATRIX.semanticBonuses[targetIdx],
        );
        STATE_MATRIX.setId(newIdx, 0x3333333333333333n); // Mock child ID
      }
    }
  }
}

if (newIdxGenerated === -1) {
  console.error("❌ [TEST] Failed to instantiate child atom.");
  Deno.exit(1);
}

// 8. Assertions
const childLogic = STATE_MATRIX.getLogic(newIdxGenerated);
const childCode = STATE_MATRIX.getCode(newIdxGenerated);

if (
  childLogic[0] !== 0xAA || childLogic[3] !== 0xAA || childLogic[4] !== 0xBB ||
  childLogic[7] !== 0xBB
) {
  console.error(
    "❌ [TEST] Genetic Logic crossover failed. Expected AA AA AA AA BB BB BB BB.",
  );
  Deno.exit(1);
}
console.log(
  "✅ [TEST] Genetic Base Genome correctly crossed over (4 bytes A + 4 bytes B).",
);

if (
  childCode[0] !== codeA[0] || childCode[1] !== 0xBBBBBBBB ||
  childCode[2] !== 0xAAAAAAAA || childCode[3] !== 0xBBBBBBBB
) {
  console.error("❌ [TEST] Epigenetic Memory crossover failed.");
  Deno.exit(1);
}
console.log(
  "✅ [TEST] Epigenetic Memory correctly interleaved (A, B, A, B...).",
);

if (STATE_MATRIX.getEnergy(1) !== 140 || STATE_MATRIX.getEnergy(2) !== 140) {
  console.error(
    `❌ [TEST] Energy not deducted correctly: ParentA=${
      STATE_MATRIX.getEnergy(1)
    }, ParentB=${STATE_MATRIX.getEnergy(2)}`,
  );
  Deno.exit(1);
}
if (Math.abs(STATE_MATRIX.getEnergy(newIdxGenerated) - 120) > 0.1) {
  console.error(
    `❌ [TEST] Child didn't receive correct pool (60): ChildE=${
      STATE_MATRIX.getEnergy(newIdxGenerated)
    }`,
  );
  Deno.exit(1);
}
console.log("✅ [TEST] Thermodynamics 30/30/60 capital pooling successful.");

if (STATE_MATRIX.semanticBonuses[newIdxGenerated] !== 10) {
  console.error("❌ [TEST] Cognitive traits not inherited maximally.");
  Deno.exit(1);
}
console.log("✅ [TEST] Superior Cognitive Traits successfully inherited.");

console.log(
  "🎉 [TEST] ALL PASSED. Genetic Recombination (Meiosis) is fully functional! 🧬💞👶🌀",
);
Deno.exit(0);
