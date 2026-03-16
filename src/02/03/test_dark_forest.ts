import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PULSE } from "@g";
import { MX } from "@g";
import { OP_SET, SYS_SCAN, OP_SYSCALL, OP_PUT } from "@g";

Deno.test({
  name: "Stage 37: The Dark Forest Topology (Radar & Stealth)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    MX.clear();
    Atomics.store(MX.tickCounter, 0, 0);

    const PREDATOR = 1;
    const PREY = 2;

    // ----- SETUP -----
    const setup = (preyResonance: number) => {
      MX.clear();
      Atomics.store(MX.tickCounter, 0, 0);

      MX.setId(PREDATOR, 999n);
      MX.setX(PREDATOR, 100);
      MX.setY(PREDATOR, 100);
      MX.setEnergy(PREDATOR, 500000);
      MX.setRole(PREDATOR, 1);

      MX.setId(PREY, 111n);
      MX.setX(PREY, 120);
      MX.setY(PREY, 120);
      MX.setEnergy(PREY, 50000); // 50k energy
      MX.setResonance(PREY, preyResonance);
      MX.setRole(PREY, 1);

      // ----- PREDATOR SCRIPT (SYS_SCAN) -----
      const predScript = new Uint8Array(64);
      predScript[0] = OP_SET;
      predScript[1] = 0; // R0
      predScript[2] = SYS_SCAN;
      predScript[3] = OP_SET;
      predScript[4] = 1; // R1
      predScript[5] = 50; // SCAN radius 50
      predScript[6] = OP_SYSCALL;
      predScript[7] = 0; // Trigger SCAN
      MX.setInstructions(PREDATOR, predScript);
    };

    await PULSE.initWorkers(1);

    // ==========================================
    // SCENARIO A: PREY IS VISIBLE (Res=50)
    // ==========================================
    setup(50);
    await PULSE.tick();

    let scanResultA = MX.getReg(PREDATOR, 0);
    assertEquals(
      scanResultA,
      PREY,
      "SYS_SCAN should detect Prey with Resonance 50",
    );

    // ==========================================
    // SCENARIO B: PREY IS INVISIBLE (Res=0)
    // ==========================================
    setup(0);
    await PULSE.tick();

    let scanResultB = MX.getReg(PREDATOR, 0);
    assertEquals(
      scanResultB,
      -1,
      "SYS_SCAN should ignore Prey with Resonance 0 (Stealth)",
    );

    // ==========================================
    // SCENARIO C: PAID RESONANCE & STEALTH DROP
    // ==========================================
    MX.clear();
    Atomics.store(MX.tickCounter, 0, 0);

    const ATOM_C = 3;
    MX.setId(ATOM_C, 333n);
    MX.setX(ATOM_C, 100);
    MX.setY(ATOM_C, 100);
    MX.setEnergy(ATOM_C, 100);
    MX.setResonance(ATOM_C, 10);
    MX.setRole(ATOM_C, 1);

    const scriptC = new Uint8Array(64);
    // instruction 1: PUT 0 to PROP_RESONANCE (Stealth Drop)
    scriptC[0] = OP_SET;
    scriptC[1] = 0; // R0
    scriptC[2] = 0; // val 0
    scriptC[3] = OP_PUT;
    scriptC[4] = 0; // Target R0 (0)
    scriptC[5] = 1; // PROP_RESONANCE
    // instruction 2: PUT 50 to PROP_RESONANCE (Costs 50 Energy)
    scriptC[6] = OP_SET;
    scriptC[7] = 1; // R1
    scriptC[8] = 50; // val 50
    scriptC[9] = OP_PUT;
    scriptC[10] = 1; // Target R1 (50)
    scriptC[11] = 1; // PROP_RESONANCE

    MX.setInstructions(ATOM_C, scriptC);

    // Execute multiple ticks to ensure instructions run
    for (let i = 0; i < 5; i++) {
      await PULSE.tick();
      console.log(
        `[TICK ${i}] Atom C: Res=${MX.getResonance(ATOM_C)} Energy=${
          MX.getEnergy(ATOM_C)
        }`,
      );
    }

    const finalRes = MX.getResonance(ATOM_C);
    const finalEnergy = MX.getEnergy(ATOM_C);

    // Initial Energy = 100.
    // Drop to 0 resonance = Free. Energy = 100.
    // Rise to 50 resonance = Costs 50. Energy = 50.
    // NOTE: Resonance naturally decays by ~2 per tick. By tick 5, it should be around 40-42.
    if (finalRes < 35 || finalRes > 50) {
      throw new Error(
        `Resonance did not inflate correctly! Expected ~40-50, got ${finalRes}`,
      );
    }

    if (finalEnergy > 50) {
      throw new Error(
        `Energy was not deducted! Expected <= 50, got ${finalEnergy}`,
      );
    }

    PULSE.stopWorkers();
  },
});
