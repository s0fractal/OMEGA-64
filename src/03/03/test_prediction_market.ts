import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { PULSE } from "@02";
import { betPoolInt, marketState, PREDICTION_MARKET } from "@03";
import { OP_SET, SYS_BET, OP_SYSCALL, SYS_YIELD } from "../../00/STATE_MATRIX.ts";

Deno.test("Prediction Market: SYS_BET energy transfer", async () => {
  STATE_MATRIX.clear();
  Atomics.store((STATE_MATRIX as any).syncState, 0, 0);

  // Re-init workers to ensure they pick up marketBuffer
  await PULSE.initWorkers(1);

  const idx = 1;
  STATE_MATRIX.setId(idx, 100n);
  STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_PRODUCER);
  STATE_MATRIX.setEnergy(idx, 100000);

  // Bet 5 energy
  // R1 = 5
  // OP_SYSCALL with R0 = SYS_BET
  const betScript = new Uint8Array(64);
  betScript[0] = OP_SET;
  betScript[1] = 1;
  betScript[2] = 5;

  betScript[3] = OP_SET;
  betScript[4] = 0;
  betScript[5] = SYS_BET;

  betScript[6] = OP_SYSCALL;

  // Followed by yield
  betScript[7] = OP_SET;
  betScript[8] = 0;
  betScript[9] = SYS_YIELD;
  betScript[10] = OP_SYSCALL;

  STATE_MATRIX.setInstructions(idx, betScript);

  // Start crisis with a dummy genome
  const newGenome = new Uint8Array(64);
  newGenome[0] = 0xff;
  PREDICTION_MARKET.startCrisis(newGenome);

  assertEquals(Atomics.load(marketState, 0), 1, "Crisis should be active");
  assertEquals(Atomics.load(betPoolInt, 0), 0, "Bet pool should start at 0");

  // Run a cycle to execute the SYS_BET
  await PULSE.tick();

  const energyAfter = STATE_MATRIX.getEnergy(idx);
  // Math: started with 100k, bet 5. gasCost for SYS_BET is 5.
  // 100k - (5 bet + 5 gas + 1 yield) = 99989
  // Wait, internal energy is * 1000 => 100,000,000.
  // Gas cost 5 => 5000 units. Yield gas 1 => 1000 units.
  // Scaled bet 5 => 5000 units.
  // Energy in atoms: 100000 -> 99989 approx depending on base tax.

  const poolVal = Atomics.load(betPoolInt, 0);
  assertEquals(
    poolVal,
    5000,
    "Bet pool should have 5000 scaled units from Atom 1",
  );

  // The atom wagered and its energy naturally decreased
  // Resolve Crisis directly
  // Fake the pot to be high enough for CRISIS_THRESHOLD (5000 scaled = 5.0 raw > 5000.0 needed?)
  // CRISIS_THRESHOLD is 5000.0. The final bet is poolVal / 1000. So we need 5 million in poolVal.
  Atomics.store(betPoolInt, 0, 6000000);

  PREDICTION_MARKET.resolveCrisis();

  assertEquals(
    Atomics.load(marketState, 0),
    0,
    "Market should be inactive after resolve",
  );

  // Because pool was > threshold, the mutation should be adopted into atom 1
  const adopted = STATE_MATRIX.getInstructions(idx);
  assertEquals(adopted[0], 0xff, "Mutation should have been applied");

  // Cleanup test
  STATE_MATRIX.clear();
  PULSE.stopWorkers();
});
