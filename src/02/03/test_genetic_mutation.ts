// OMEGA-64 | test_genetic_mutation.ts | Stage 34 Verification
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { STATE_MATRIX, LOGGER, Li } from "@generated";
import {
  PULSE
} from "@generated";

import {
  OP_SET,
  SYS_YIELD,
  OP_SYSCALL,
  SYS_MUTATE,
  OP_NOP
} from "@generated";

Deno.test("Stage 34: Genetic Mutation Engine (SYS_MUTATE)", async () => {
  Li("--- STAGE 34: GENETIC MUTATION TEST ---");

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.syncState, 0, 0);
  Atomics.store(STATE_MATRIX.tickCounter, 0, 100);
  await PULSE.initWorkers(1);

  const atomA = 50; // Mutator
  const atomB = 51; // Target

  STATE_MATRIX.setId(atomA, 50n);
  STATE_MATRIX.setEnergy(atomA, 5000); // Plenty of energy to afford 50 gas

  STATE_MATRIX.setId(atomB, 51n);
  STATE_MATRIX.setEnergy(atomB, 1000);

  // Atom B starts with a benign script: SET R0 = SYS.YIELD (0x01), SYSCALL
  const scriptB = new Uint8Array(64);
  scriptB[0] = OP_SET;
  scriptB[1] = 0;
  scriptB[2] = SYS_YIELD;
  scriptB[3] = OP_SYSCALL;
  scriptB[4] = 0;
  STATE_MATRIX.setInstructions(atomB, scriptB);

  // Atom A will mutate Atom B: Replace the first instruction with OP_NOP (0x00)
  const scriptA = new Uint8Array(64);
  scriptA[0] = OP_SET;
  scriptA[1] = 0;
  scriptA[2] = SYS_MUTATE; // R0 = SysId
  scriptA[3] = OP_SET;
  scriptA[4] = 1;
  scriptA[5] = atomB; // R1 = targetIdx
  scriptA[6] = OP_SET;
  scriptA[7] = 2;
  scriptA[8] = 0; // R2 = offset
  scriptA[9] = OP_SET;
  scriptA[10] = 3;
  scriptA[11] = OP_NOP; // R3 = newValue (0)
  scriptA[12] = OP_SYSCALL;
  scriptA[13] = 0;
  STATE_MATRIX.setInstructions(atomA, scriptA);

  // Verify before state
  assertEquals(
    STATE_MATRIX.getInstructions(atomB)[0],
    OP_SET,
    "Atom B should start with OP_SET",
  );

  Li("Executing mutation pulse...");
  await PULSE.tick();

  // Verify after state
  const mutatedScriptB = STATE_MATRIX.getInstructions(atomB);
  assertEquals(
    mutatedScriptB[0],
    OP_NOP,
    "Atom B's first instruction should be mutated to OP_NOP",
  );
  assertEquals(
    mutatedScriptB[2],
    SYS_YIELD,
    "Atom B's third instruction should be untouched",
  );

  // Verify cost deduction
  const energyA = STATE_MATRIX.getEnergy(atomA);
  // Initial 5000. Mutate costs 50 gas -> 50,000 scaled. Wait, 50 gas * 1000 = 50000 scaled.
  // Initial energy was 5000 unscaled (5,000,000 scaled).
  // Cost is 50 * 1000 = 50,000. Base tax is 100.
  // 5000 - 50 = 4950.
  // Metabolism might deduct 0.1 unscaled.
  Li(`Atom A remaining energy: ${energyA / 1000} (Expect ~4949.9)`);
  assertEquals(
    energyA < 5000 * 1000,
    true,
    "Atom A should have spent energy on mutation",
  );

  Li("--- STAGE 34: SUCCESS ---");
  PULSE.stopWorkers();
});
