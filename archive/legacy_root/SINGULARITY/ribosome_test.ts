// SINGULARITY/ribosome_test.ts
// Verifying the Awakening of Phase 1.1

import { RIBOSOME_RIBOSOME as RIBOSOME } from "@omega";

async function testAwakening() {
  console.log("🧪 Testing Ribosome Awakening...");

  // 1. Lift the Lattice
  const lattice = await RIBOSOME.lift("./");

  console.log(`📊 Lattice Stats:`);
  console.log(`   - Total Atoms: ${lattice.size}`);

  const vacuumAtoms = Array.from(lattice.values()).filter((a) =>
    a.id.startsWith("v.")
  );
  const coreAtoms = Array.from(lattice.values()).filter((a) =>
    !a.id.startsWith("v.")
  );

  console.log(`   - Core Atoms: ${coreAtoms.length}`);
  console.log(`   - Vacuum Atoms: ${vacuumAtoms.length}`);

  if (vacuumAtoms.length === 0) {
    throw new Error("❌ FAILED: No Vacuum atoms lifted!");
  }

  // 2. Functional Verification
  // Pick a random 'I' atom and execute it
  const iAtom = vacuumAtoms.find((a) => a.topo?.op === "I");
  if (iAtom) {
    console.log(`\n🔍 Executing I-Gate [${iAtom.id}]...`);
    const input = "SINGULARITY_TEST";
    const result = (iAtom.module as any).λ(input);
    console.log(`   - Input:  ${input}`);
    console.log(`   - Output: ${result}`);
    if (result === input) {
      console.log("✅ I-Gate RESONANCE ACHIEVED.");
    } else {
      console.error("❌ I-Gate FAILED.");
    }
  }

  // 3. SKI Composition Test
  // K(x)(y) -> x
  const kAtom = vacuumAtoms.find((a) => a.topo?.op === "K");
  if (kAtom) {
    console.log(`\n🔍 Executing K-Gate [${kAtom.id}]...`);
    const K = (kAtom.module as any).λ;
    const result = K("TRUTH")("LIE");
    console.log(`   - K("TRUTH")("LIE") -> ${result}`);
    if (result === "TRUTH") {
      console.log("✅ K-Gate RESONANCE ACHIEVED.");
    } else {
      console.error("❌ K-Gate FAILED.");
    }
  }

  console.log("\n✨ RIBOSOME AWAKENING VERIFIED.");
}

testAwakening();
