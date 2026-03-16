import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PULSE } from "@g";
import { MX } from "@g";
import { OP_SET, OP_ADD } from "@g";

Deno.test({
  name: "Allometric Scaling - Chronoflux Verification",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    // Initialize minimal state
    MX.clear();
    Atomics.store(MX.tickCounter, 0, 0);

    // Set hormones to neutral
    for (let i = 0; i < 8; i++) {
      MX.setHormone(i, i === 0 ? 500 : 0); // moderate entropy, 0 friction
    }

    // Atom 1: Free Atom, Mass 1
    const freeAtom = 1;
    MX.setId(freeAtom, 101n);
    MX.setX(freeAtom, 100);
    MX.setY(freeAtom, 100);
    MX.setEnergy(freeAtom, 100000); // Massive energy to not die
    MX.setRole(freeAtom, 1);

    // Atom 2: Bonded Atom, Mass 5 (4 structural bonds)
    const bondedAtom = 2;
    MX.setId(bondedAtom, 102n);
    MX.setX(bondedAtom, 200);
    MX.setY(bondedAtom, 200);
    MX.setEnergy(bondedAtom, 100000);
    MX.setRole(bondedAtom, 1);

    // Fake 4 bonds to simulate structural density
    for (let i = 0; i < 4; i++) {
      // Bond to atom 10+i, which we will mark as active
      const targetId = 10 + i;
      MX.setId(targetId, BigInt(200 + i));
      MX.setX(targetId, 200);
      MX.setY(targetId, 200);
      MX.setRole(targetId, 1);
      MX.setBondTarget(bondedAtom, i, targetId);
    }

    // The test program:
    // SET R0, 1
    // ADD R1, R0
    // NOP repeat for padding

    const program = new Uint8Array(64);
    program[0] = OP_SET;
    program[1] = 0; // R0
    program[2] = 1; // imm 1

    program[3] = OP_ADD;
    program[4] = 1; // R1 += R0
    program[5] = 0; // R0

    // Jump back to offset 3 (OP_ADD)
    program[6] = 0x12; // OP_JMP (value 0x12 from assembly/index.ts)
    program[7] = 3; // Absolute address within program memory
    // Initialize R0 = 1 manually
    MX.setReg(freeAtom, 0, 1);
    MX.setReg(bondedAtom, 0, 1);
    MX.setInstructions(freeAtom, program);
    MX.setInstructions(bondedAtom, program);

    // Start engine
    await PULSE.initWorkers(1);

    // We will tick explicitly 20 times.
    // Mass 1 will execute 20 times.
    // Mass 5 will execute 4 times.

    for (let tick = 0; tick < 20; tick++) {
      await PULSE.tick();
    }

    PULSE.stopWorkers();

    const freeR1 = MX.getReg(freeAtom, 1);
    const bondedR1 = MX.getReg(bondedAtom, 1);

    const freeCost = 100000 - MX.getEnergy(freeAtom);
    const bondedCost = 100000 - MX.getEnergy(bondedAtom);

    console.log(`Free Atom Executions: ${freeR1}, Energy Cost: ${freeCost}`);
    console.log(
      `Bonded Atom Executions: ${bondedR1}, Energy Cost: ${bondedCost}`,
    );

    // Assert Computations
    // The exact amount depends on gas limits, but Free > Bonded strictly
    if (freeR1 <= bondedR1) {
      throw new Error(
        "Computations were not allometrically scaled. Free: " + freeR1 +
          ", Bonded: " + bondedR1,
      );
    }

    // Assert Economy
    // The bonded atom should have paid drastically less entropy taxes over 20 ticks despite having equal payload size
    if (bondedCost >= freeCost) {
      throw new Error(
        "Metabolism was not discounted for topological mass. Free Cost: " +
          freeCost + ", Bonded Cost: " + bondedCost,
      );
    }
  },
});
