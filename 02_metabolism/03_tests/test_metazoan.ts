import { assertEquals, assertGreater } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PULSE } from "../mod.ts";
import { RISC, STATE_MATRIX, SYS } from "../../00_substrate/mod.ts";

Deno.test({
  name: "Phase 40: Metazoan Emergence (Membrane Defense)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    STATE_MATRIX.clear();
    Atomics.store(STATE_MATRIX.tickCounter, 0, 0);

    const PREDATOR = 5;
    const ATOM_A = 1;
    const ATOM_B = 2;
    const ATOM_C = 3;

    // Helper to setup predator attacking B
    const setupPredator = () => {
      STATE_MATRIX.setId(PREDATOR, 999n);
      STATE_MATRIX.setX(PREDATOR, 100);
      STATE_MATRIX.setY(PREDATOR, 100);
      STATE_MATRIX.setEnergy(PREDATOR, 50000);
      STATE_MATRIX.setResonance(PREDATOR, 260); // Must be > 250 for steal syscall locally, and larger than target resonance
      STATE_MATRIX.setRole(PREDATOR, STATE_MATRIX.ROLE_PARASITE);

      // Predator script: Steal energy from ATOM_B
      // Syscall Transfer: targetIdx=B, resource_type=0 (energy), amount=-1000 (steal)
      const predScript = new Uint8Array(64);
      predScript[0] = RISC.OP_SET;
      predScript[1] = 0; // R0
      predScript[2] = SYS.TRANSFER; // 10
      
      predScript[3] = RISC.OP_SET;
      predScript[4] = 1; // R1
      predScript[5] = ATOM_B; // Target: 2
      
      predScript[6] = RISC.OP_SET;
      predScript[7] = 2; // R2
      predScript[8] = 0; // Resource: 0 (Energy)
      
      predScript[9] = RISC.OP_SET;
      predScript[10] = 3; // R3
      predScript[11] = 0;
      
      predScript.set([
         RISC.OP_SET, 4, 100,  // R4 = 100
         RISC.OP_SUB, 3, 4,    // R3 = R3 - R4 = -100
         RISC.OP_SYSCALL, 0
      ], 12);

      STATE_MATRIX.setInstructions(PREDATOR, predScript);
    };

    const setupPrey = (cyclic: boolean) => {
      // Create A, B, C clustered together
      STATE_MATRIX.setId(ATOM_A, 111n);
      STATE_MATRIX.setX(ATOM_A, 100);
      STATE_MATRIX.setY(ATOM_A, 110);
      STATE_MATRIX.setEnergy(ATOM_A, 10000);
      STATE_MATRIX.setResonance(ATOM_A, 50);

      STATE_MATRIX.setId(ATOM_B, 222n);
      // B must be close to predator to be stolen from (< 1.5 distance sq. 10 units = 1.0)
      STATE_MATRIX.setX(ATOM_B, 105);
      STATE_MATRIX.setY(ATOM_B, 105);
      STATE_MATRIX.setEnergy(ATOM_B, 10000);
      STATE_MATRIX.setResonance(ATOM_B, 50); // Predator (260) > Target (50) -> Steal succeeds

      STATE_MATRIX.setId(ATOM_C, 333n);
      STATE_MATRIX.setX(ATOM_C, 110);
      STATE_MATRIX.setY(ATOM_C, 100);
      STATE_MATRIX.setEnergy(ATOM_C, 10000);
      STATE_MATRIX.setResonance(ATOM_C, 50);

      // Bond A -> B -> C
      const bondsA = STATE_MATRIX.getBonds(ATOM_A);
      Atomics.store(bondsA, 0, ATOM_B);

      const bondsB = STATE_MATRIX.getBonds(ATOM_B);
      Atomics.store(bondsB, 0, ATOM_C);

      const bondsC = STATE_MATRIX.getBonds(ATOM_C);
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
    STATE_MATRIX.clear();
    setupPrey(false);
    setupPredator();

    let initialEnergyB = STATE_MATRIX.getEnergy(ATOM_B);
    let initialPredatorEnergy = STATE_MATRIX.getEnergy(PREDATOR);

    await PULSE.tick(); // Apply physics + compute
    
    // Shield should be 0 because it's not a ring
    assertEquals(STATE_MATRIX.getEvolutionReserved(ATOM_B), 0, "No shield should exist for linear chain");
    
    // Should have stolen energy
    const finalEnergyB = STATE_MATRIX.getEnergy(ATOM_B);
    const finalPredatorEnergy = STATE_MATRIX.getEnergy(PREDATOR);

    console.log(`Initial B: ${initialEnergyB}, Final B: ${finalEnergyB}`);
    console.log(`Initial Pred: ${initialPredatorEnergy}, Final Pred: ${finalPredatorEnergy}`);

    assertGreater(initialEnergyB, finalEnergyB, "Predator should have drained energy from Victim B");
    // Predator pays metabolic cost but gains 100 scaled energy
    assertGreater(finalPredatorEnergy, initialPredatorEnergy + 50, "Predator should have gained stolen energy");

    // ==========================================
    // SCENARIO B: Cyclic Ring (Membrane Protection)
    // ==========================================
    console.log("--- SCENARIO B: Membrane Ring ---");
    STATE_MATRIX.clear();
    setupPrey(true);
    setupPredator();

    initialEnergyB = STATE_MATRIX.getEnergy(ATOM_B);
    initialPredatorEnergy = STATE_MATRIX.getEnergy(PREDATOR);

    // Run a tick. The Membrane topological sort happens at the end of the tick.
    await PULSE.tick();

    // Verify Membrane characteristics
    let shieldB = STATE_MATRIX.getEvolutionReserved(ATOM_B);
    
    // Total resonance should be sum of 3 atoms ~ 150 (minus metabolic decay ~ 144)
    assertGreater(shieldB, 130, "Membrane Ring should have aggregated Defense Shield");

    let finalEnergyB_cycle = STATE_MATRIX.getEnergy(ATOM_B);
    let finalPredatorEnergy_cycle = STATE_MATRIX.getEnergy(PREDATOR);

    // Wait, the steal happens BEFORE the membrane is formed?
    // In pulse.rs: VM tick -> Syscall execution -> Membrane Physics.
    // So on TICK 1, the membrane hasn't been formed YET when the VM runs!
    // We must run tick 1 to form the membrane, THEN tick 2 for the predator to attack!

    // Resetting for proper sequential timeline:
    console.log("--- SCENARIO B (Recalibrated for Formative Tick) ---");
    STATE_MATRIX.clear();
    setupPrey(true);
    
    // Tick 1: Autopoietic Metazoan Formation
    await PULSE.tick();

    shieldB = STATE_MATRIX.getEvolutionReserved(ATOM_B);
    assertGreater(shieldB, 130, "Membrane Ring should be fully active after Tick 1");

    // Tick 2: Attack
    setupPredator();
    initialEnergyB = STATE_MATRIX.getEnergy(ATOM_B);
    initialPredatorEnergy = STATE_MATRIX.getEnergy(PREDATOR);
    
    await PULSE.tick();

    finalEnergyB_cycle = STATE_MATRIX.getEnergy(ATOM_B);
    finalPredatorEnergy_cycle = STATE_MATRIX.getEnergy(PREDATOR);

    // Energy should NOT drop by 100k, only by minor ~10 basal metabolism
    assertEquals(finalEnergyB_cycle > initialEnergyB - 100, true, "Ring Armor should strictly block Predator theft");

    // Predator should actually LOSE energy from the attempt (failed syscall / execution cost) without gaining 100k
    assertGreater(initialPredatorEnergy, finalPredatorEnergy_cycle, "Predator should not gain energy on failed steal");

    PULSE.stopWorkers();
  },
});
