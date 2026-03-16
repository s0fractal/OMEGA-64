// OMEGA-64 | test_semantic_mutation.ts | Stage 29 Verification
import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.210.0/assert/mod.ts";
import { MX, LOGGER, Li } from "@g";
import {
  PULSE
} from "@g";

import {
  OP_SET,
  SYS_MUTATE,
  OP_SYSCALL
} from "@g";

Deno.test("Stage 29: Open Semantic Mutation via SYS_MUTATE", async () => {
  Li("--- STAGE 29: SEMANTIC MUTATION TEST ---");

  // 1. Initialize world
  MX.clear();
  Atomics.store(MX.syncState, 0, 0); // Ensure IDLE (0)
  Atomics.store(MX.tickCounter, 0, 1); // Skip Gate audit
  await PULSE.initWorkers(1);

  // 2. Spawn a test atom
  const atomId = 1n; // We know ID 1 is the first spawned
  const atomIdx = 1; // Index 1
  MX.setId(atomIdx, atomId);
  MX.setEnergy(atomIdx, 1000); // 1000 Energy

  // 3. Write a self-mutating script
  // R0 = SYSCALL_ID (SYS.MUTATE = 0x07)
  // R1 = offset (2)
  // R2 = new instruction (OP_HALT = 0x00)

  const script = new Uint8Array(64);
  // Setup registers
  script[0] = OP_SET;
  script[1] = 0; // r0
  script[2] = SYS_MUTATE; // syscall id

  script[3] = OP_SET;
  script[4] = 1; // r1
  script[5] = 2; // offset = 2

  script[6] = OP_SET;
  script[7] = 2; // r2
  script[8] = 0; // new value (OP_HALT)

  // Call SYS_MUTATE
  script[9] = OP_SYSCALL;
  script[10] = 0; // dummy, OP_SYSCALL doesn't take reg args in RISC-I directly since R0-R3 are hardcoded for syscall context

  MX.setInstructions(atomIdx, script);

  // Verify initial instruction at offset 2 is SYS.MUTATE before tick
  let currentInst = MX.getInstructions(atomIdx);
  assertEquals(
    currentInst[2],
    SYS_MUTATE,
    "Initial instruction at offset 2 should be SYS.MUTATE (7)",
  );

  // 4. Tick to execute the mutation
  Li("Ticking to execute SYS_MUTATE...");
  await PULSE.tick();

  // 5. Verify mutation was applied
  // Memory offset 2 is where SYS.MUTATE was stored. We told atom to mutate offset 2 to 0 (OP_HALT).
  currentInst = MX.getInstructions(atomIdx);
  assertEquals(
    currentInst[2],
    0,
    "Instruction at offset 2 should have been mutated to 0 (OP_HALT)",
  );

  // 6. Verify Gas deduction
  // Expecting:
  // OP_SET (1) * 3 = 3
  // OP_SYSCALL (50) = 50
  // Total gas = 53
  // Initial energy = 1000. Expected remaining is ~950 after syscall and metabolic ticks
  const remainingEnergy = MX.getEnergy(atomIdx);
  Li(`Remaining energy: ${remainingEnergy}`);
  assertEquals(
    remainingEnergy < 955 && remainingEnergy > 945,
    true,
    `Energy should reflect the high cost of SYS_MUTATE (~950). Got: ${remainingEnergy}`,
  );

  Li("--- STAGE 29: SUCCESS ---");

  // Cleanup
  PULSE.stopWorkers();
});
