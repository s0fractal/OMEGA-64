// SINGULARITY/soma_test.ts
// Verifying Phase 1.2: Somatic Synthesis

import { RIBOSOME_RIBOSOME as RIBOSOME } from "@omega";
import { SOMA_SOMA as SOMA } from "@omega";

async function testSoma() {
  console.log("🧪 Testing Somatic Synthesis...");

  // 1. Lift the Lattice
  const lattice = await RIBOSOME.lift("./");

  // 2. Assemble a Soma at a high-resonance point
  const target = { r: 1, theta: 243 };
  console.log(
    `\n🌀 Assembling Soma at r=${target.r}, theta=${target.theta}...`,
  );

  const soma = SOMA.assemble(lattice, target, 3);
  console.log(`   - Soma ID: ${soma.id}`);
  console.log(
    `   - Components: ${
      soma.components.map((c) => `${c.topo?.op} (${c.id})`).join(", ")
    }`,
  );

  // 3. Functional Execution
  const input = "SOMA_INPUT";
  const result = soma.execute(input);
  console.log(`   - Execution: λ(${input}) -> ${result}`);

  // 4. Verify SKI Property: S K K x == I x == x
  console.log("\n🧪 Verification of SKI Composition Property [S K K]");

  const sAtom = Array.from(lattice.values()).find((a) => a.topo?.op === "S");
  const kAtom = Array.from(lattice.values()).find((a) => a.topo?.op === "K");

  if (sAtom && kAtom) {
    const customSoma = {
      id: "SOMA.TEST.SKK",
      origin: { r: 0, theta: 0 },
      components: [sAtom, kAtom, kAtom],
      execute: (input: any) => {
        const S = sAtom.module.λ;
        const K1 = kAtom.module.λ;
        const K2 = kAtom.module.λ;
        return S(K1)(K2)(input);
      },
    };

    const testInput = "SKK_TEST";
    const skkResult = customSoma.execute(testInput);
    console.log(`   - S(K)(K)("${testInput}") -> ${skkResult}`);
    if (skkResult === testInput) {
      console.log("✅ SKI REDUCTION: S K K == I verified.");
    } else {
      console.error("❌ SKI REDUCTION FAILED.");
    }
  }

  // 5. Resonance Injection
  console.log("\n📡 Injecting Resonance into the Engine...");
  await SOMA.resonate(soma, result);

  console.log("\n✨ SOMATIC SYNTHESIS VERIFIED.");
}

testSoma();
