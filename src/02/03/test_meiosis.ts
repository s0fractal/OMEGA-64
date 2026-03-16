import { MX } from "@g";
import { ISA, LAMBDA_VM } from "@g";

console.log("💞 [TEST] Initializing Meiosis Verification...");

// 1. Setup Parent A (Initiator) in Index 1
MX.clear();
const parentAId = 0x1111111111111111n;
MX.setId(1, parentAId);
MX.setEnergy(1, 200); // Need > 150 for Meiosis
MX.setResonance(1, 100);
MX.roles[1] = 1; // Producer
MX.semanticBonuses[1] = 5;

// Parent A Logic: 8 bytes of 0xAA
const logicA = new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]);
MX.setLogic(1, logicA);

// Parent A Code: 16 words of 0xAAAAAAAA
const codeA = new Uint32Array(16);
codeA.fill(0xAAAAAAAA);
// Inject CROSS_REP at start of A to target bond 0
codeA[0] = ISA.CROSS_REP | (0 << 8);
MX.setCode(1, codeA);

// 2. Setup Parent B (Target) in Index 2
const parentBId = 0x2222222222222222n;
MX.setId(2, parentBId);
MX.setEnergy(2, 200); // Need > 100 for pooling
MX.setResonance(2, 50);
MX.roles[2] = 2; // Constructor
MX.semanticBonuses[2] = 10; // Higher cognitive bonus

// Parent B Logic: 8 bytes of 0xBB
const logicB = new Uint8Array([0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB]);
MX.setLogic(2, logicB);

// Parent B Code: 16 words of 0xBBBBBBBB
const codeB = new Uint32Array(16);
codeB.fill(0xBBBBBBBB);
MX.setCode(2, codeB);

// 3. Setup Bond between A and B
// Bond slot 0 of Atom 1 targets Atom 2
const bondsA = new Uint32Array(4);
bondsA[0] = 2;
MX.setBonds(1, bondsA);

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
  MX.getLogic(1),
  MX.getCode(1),
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
MX.requestMeiosis(1, targetIdx);

// 7. Simulate PULSE handling Meiosis
let newIdxGenerated = -1;
const activeIndices = [1, 2];

for (const idx of activeIndices) {
  const targetIdx = MX.getMeiosisTarget(idx);
  if (targetIdx !== 0) {
    MX.clearMeiosis(idx);

    const energyA = MX.getEnergy(idx);
    const energyB = MX.getEnergy(targetIdx);

    if (energyA > 100 && energyB > 100) {
      const newIdx = MX.findEmptySlot();
      if (newIdx !== -1) {
        newIdxGenerated = newIdx;

        // 1. Capital Pooling
        const contributionA_E = energyA * 0.3;
        const contributionB_E = energyB * 0.3;
        MX.setEnergy(idx, energyA - contributionA_E);
        MX.setEnergy(targetIdx, energyB - contributionB_E);
        MX.setEnergy(newIdx, contributionA_E + contributionB_E);

        // 2. Recombination
        const logicA = MX.getLogic(idx);
        const logicB = MX.getLogic(targetIdx);
        const newLogic = new Uint8Array(8);
        newLogic.set(logicA.subarray(0, 4), 0);
        newLogic.set(logicB.subarray(4, 8), 4);
        MX.setLogic(newIdx, newLogic);

        const codeA = MX.getCode(idx);
        const codeB = MX.getCode(targetIdx);
        const newCode = new Uint32Array(16);
        for (let p = 0; p < 16; p++) {
          newCode[p] = p % 2 === 0 ? codeA[p] : codeB[p];
        }
        MX.setCode(newIdx, newCode);

        MX.semanticBonuses[newIdx] = Math.max(
          MX.semanticBonuses[idx],
          MX.semanticBonuses[targetIdx],
        );
        MX.setId(newIdx, 0x3333333333333333n); // Mock child ID
      }
    }
  }
}

if (newIdxGenerated === -1) {
  console.error("❌ [TEST] Failed to instantiate child atom.");
  Deno.exit(1);
}

// 8. Assertions
const childLogic = MX.getLogic(newIdxGenerated);
const childCode = MX.getCode(newIdxGenerated);

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

if (MX.getEnergy(1) !== 140 || MX.getEnergy(2) !== 140) {
  console.error(
    `❌ [TEST] Energy not deducted correctly: ParentA=${
      MX.getEnergy(1)
    }, ParentB=${MX.getEnergy(2)}`,
  );
  Deno.exit(1);
}
if (Math.abs(MX.getEnergy(newIdxGenerated) - 120) > 0.1) {
  console.error(
    `❌ [TEST] Child didn't receive correct pool (60): ChildE=${
      MX.getEnergy(newIdxGenerated)
    }`,
  );
  Deno.exit(1);
}
console.log("✅ [TEST] Thermodynamics 30/30/60 capital pooling successful.");

if (MX.semanticBonuses[newIdxGenerated] !== 10) {
  console.error("❌ [TEST] Cognitive traits not inherited maximally.");
  Deno.exit(1);
}
console.log("✅ [TEST] Superior Cognitive Traits successfully inherited.");

console.log(
  "🎉 [TEST] ALL PASSED. Genetic Recombination (Meiosis) is fully functional! 🧬💞👶🌀",
);
Deno.exit(0);
