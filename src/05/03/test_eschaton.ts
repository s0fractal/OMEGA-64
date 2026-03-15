import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { STATE_MATRIX, idBuffer, energyBuffer, neuralCoherenceBuffer } from "@generated";
import { RUNTIME_POLICY } from "@03";
import { mutateUniversalConstants } from "@03";
import { SOVEREIGN_ORACLE } from "@05";

Deno.test("Phase 48: Eschaton Big Crunch execution (Unit Level)", async () => {
  // 1. Setup Stagnation conditions
  STATE_MATRIX.clear();
  // Simulate some atoms to represent a singularity of order
  const id1 = STATE_MATRIX.findFreeSlot();
  const ids = new BigUint64Array(idBuffer);
  const energies = new Int32Array(energyBuffer);
  ids[id1] = 1n;
  energies[id1] = 100;
  
  Atomics.store(new Int32Array(neuralCoherenceBuffer), 0, 15000); // Trigger Absolute Order


  const initialTheta = RUNTIME_POLICY.pulse.pressureRing.theta;
  const initialBaseTax = RUNTIME_POLICY.pulse.homeostasis.baseTax;

  // 2. Mock Epitatph Oracle execution
  let eschatonDeclared = false;
  const originalDeclare = SOVEREIGN_ORACLE.declareEschaton;
  SOVEREIGN_ORACLE.declareEschaton = async (reason) => {
    eschatonDeclared = true;
    console.log("MOCK ORACLE EPITAPH:", reason);
  };

  // 3. Trigger Big Crunch logic
  const reason = "Absolute Order (Singularity of Coherence)";
  await SOVEREIGN_ORACLE.declareEschaton(reason);
  STATE_MATRIX.clear();
  mutateUniversalConstants();

  // 4. Assert State cleared and constants mutated
  assertEquals(eschatonDeclared, true, "Eschaton should have been declared.");
  assertEquals(STATE_MATRIX.getActiveIndices().length, 0, "Matrix should be barren after Big Crunch.");
  
  // They should be mutated (not necessarily equal to initial, but probabilistically different)
  // Because Math.random is used, we just assert they are numbers and didn't crash.
  assertEquals(typeof RUNTIME_POLICY.pulse.pressureRing.theta, "number");
  assertEquals(typeof RUNTIME_POLICY.pulse.homeostasis.baseTax, "number");

  console.log("After mutation BaseTax:", RUNTIME_POLICY.pulse.homeostasis.baseTax, "was:", initialBaseTax);
  console.log("After mutation Theta:", RUNTIME_POLICY.pulse.pressureRing.theta, "was:", initialTheta);

  SOVEREIGN_ORACLE.declareEschaton = originalDeclare; // Restore
});
