import { assertEquals, assertGreater } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PULSE } from "@g";
import { MX } from "@g";
import { OP_SET, SYS_TRANSFER, OP_SUB, OP_SYSCALL } from "@g";

Deno.test({
  name: "Phase 40: Metazoan Emergence (Membrane Defense)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    MX.clear();
    Atomics.store(MX.tickCounter, 0, 0);

    const PREDATOR = 5;
    const ATOM_A = 1;
    const ATOM_B = 2;
    const ATOM_C = 3;

    // Helper to setup predator attacking B
    const setupPredator = () => {
      MX.setId(PREDATOR, 999n);
      MX.setX(PREDATOR, 100);
      MX.setY(PREDATOR, 100);
      MX.setEnergy(PREDATOR, 50000);
      MX.setResonance(PREDATOR, 260); // Must be > 250 for steal syscall locally, and larger than target resonance
      MX.setRole(PREDATOR, MX.ROLE_PARASITE);

      // Predator script: Steal energy from ATOM_B
      // Syscall Transfer: targetIdx=B, resource_type=0 (energy), amount=-1000 (steal)
      const predScript = new Uint8Array(64);
      predScript[0] = OP_SET;
      predScript[1] = 0; // R0
      predScript[2] = SYS_TRANSFER; // 10
      
      predScript[3] = OP_SET;
      predScript[4] = 1; // R1
      predScript[5] = ATOM_B; // Target: 2
      
      predScript[6] = OP_SET;
      predScript[7] = 2; // R2
      predScript[8] = 0; // Resource: 0 (Energy)
      
      predScript[9] = OP_SET;
      predScript[10] = 3; // R3
      predScript[11] = 0;
      
      predScript.set([
         OP_SET, 4, 100,  // R4 = 100
         OP_SUB, 3, 4,    // R3 = R3 - R4 = -100
         OP_SYSCALL, 0
      ], 12);

      MX.setInstructions(PREDATOR, predScript);
    };

    const setupPrey = (cyclic: boolean) => {
      // Create A, B, C clustered together
      MX.setId(ATOM_A, 111n);
      MX.setX(ATOM_A, 100);
      MX.setY(ATOM_A, 110);
      MX.setEnergy(ATOM_A, 10000);
      MX.setResonance(ATOM_A, 50);

      MX.setId(ATOM_B, 222n);
      // B must be close to predator to be stolen from (< 1.5 distance sq. 10 units = 1.0)
      MX.setX(ATOM_B, 105);
      MX.setY(ATOM_B, 105);
      MX.setEnergy(ATOM_B, 10000);
      MX.setResonance(ATOM_B, 50); // Predator (260) > Target (50) -> Steal succeeds

      MX.setId(ATOM_C, 333n);
      MX.setX(ATOM_C, 110);
      MX.setY(ATOM_C, 100);
      MX.setEnergy(ATOM_C, 10000);
      MX.setResonance(ATOM_C, 50);

      // Bond A -> B -> C
      const bondsA = MX.getBonds(ATOM_A);
      Atomics.store(bondsA, 0, ATOM_B);

      const bondsB = MX.getBonds(ATOM_B);
      Atomics.store(bondsB, 0, ATOM_C);

      const bondsC = MX.getBonds(ATOM_C);
      if (cyclic) {
        // C -> A forms a Membrane Ring
        Atomics.store(bondsC, 0, ATOM_A);
      } else {
        Atomics.store(bondsC, 0, 0); // Open chain
      }
    };

    await PULSE.initWorkers(1);

    // ==========================================
    // SCENARIO A: Linear Chain (No Membrane Protection)
    // ==========================================
    console.log("--- SCENARIO A: Linear Chain ---");
    MX.clear();
    setupPrey(false);
    setupPredator();

    let initialEnergyB = MX.getEnergy(ATOM_B);
    let initialPredatorEnergy = MX.getEnergy(PREDATOR);

    await PULSE.tick(); // Apply physics + compute
    
    // Shield should be 0 because it's not a ring
    assertEquals(MX.getEvolutionReserved(ATOM_B), 0, "No shield should exist for linear chain");
    
    // Should have stolen energy
    const finalEnergyB = MX.getEnergy(ATOM_B);
    const finalPredatorEnergy = MX.getEnergy(PREDATOR);

    console.log(`Initial B: ${initialEnergyB}, Final B: ${finalEnergyB}`);
    console.log(`Initial Pred: ${initialPredatorEnergy}, Final Pred: ${finalPredatorEnergy}`);

    assertGreater(initialEnergyB, finalEnergyB, "Predator should have drained energy from Victim B");
    // Predator pays metabolic cost but gains 100 scaled energy
    assertGreater(finalPredatorEnergy, initialPredatorEnergy + 50, "Predator should have gained stolen energy");

    // ==========================================
    // SCENARIO B: Cyclic Ring (Membrane Protection)
    // ==========================================
    console.log("--- SCENARIO B: Membrane Ring ---");
    MX.clear();
    setupPrey(true);
    setupPredator();

    initialEnergyB = MX.getEnergy(ATOM_B);
    initialPredatorEnergy = MX.getEnergy(PREDATOR);

    // Run a tick. The Membrane topological sort happens at the end of the tick.
    await PULSE.tick();

    // Verify Membrane characteristics
    let shieldB = MX.getEvolutionReserved(ATOM_B);
    
    // Total resonance should be sum of 3 atoms ~ 150 (minus metabolic decay ~ 144)
    assertGreater(shieldB, 130, "Membrane Ring should have aggregated Defense Shield");

    let finalEnergyB_cycle = MX.getEnergy(ATOM_B);
    let finalPredatorEnergy_cycle = MX.getEnergy(PREDATOR);

    // Wait, the steal happens BEFORE the membrane is formed?
    // In pulse.rs: VM tick -> Syscall execution -> Membrane Physics.
    // So on TICK 1, the membrane hasn't been formed YET when the VM runs!
    // We must run tick 1 to form the membrane, THEN tick 2 for the predator to attack!

    // Resetting for proper sequential timeline:
    console.log("--- SCENARIO B (Recalibrated for Formative Tick) ---");
    MX.clear();
    setupPrey(true);
    
    // Tick 1: Autopoietic Metazoan Formation
    await PULSE.tick();

    shieldB = MX.getEvolutionReserved(ATOM_B);
    assertGreater(shieldB, 130, "Membrane Ring should be fully active after Tick 1");

    // Tick 2: Attack
    setupPredator();
    initialEnergyB = MX.getEnergy(ATOM_B);
    initialPredatorEnergy = MX.getEnergy(PREDATOR);
    
    await PULSE.tick();

    finalEnergyB_cycle = MX.getEnergy(ATOM_B);
    finalPredatorEnergy_cycle = MX.getEnergy(PREDATOR);

    // Energy should NOT drop by 100k, only by minor ~10 basal metabolism
    assertEquals(finalEnergyB_cycle > initialEnergyB - 100, true, "Ring Armor should strictly block Predator theft");

    // Predator should actually LOSE energy from the attempt (failed syscall / execution cost) without gaining 100k
    assertGreater(initialPredatorEnergy, finalPredatorEnergy_cycle, "Predator should not gain energy on failed steal");

    PULSE.stopWorkers();
  },
});
