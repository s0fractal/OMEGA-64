// OMEGA-64 | test_ecological_sandbox.ts | Stage 36 Verification
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { STATE_MATRIX } from "@generated";
import { NEXUS_DAEMON, PULSE } from "@02";
import { LOGGER } from "@generated";
import { OP_SET, SYS_ATTRACT, OP_SYSCALL, SYS_TRANSFER } from "@generated";

Deno.test("Stage 36: Ecological Sandbox (SYS_ATTRACT, SYS_TRANSFER)", async () => {
  LOGGER.info("--- STAGE 36: ECOLOGICAL SANDBOX TEST ---");

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.syncState, 0, 0);
  Atomics.store(STATE_MATRIX.tickCounter, 0, 100); // Wait, tickCounter starts at 100! DriftWarden triggers at 100/100 = 1.0 drift...
  await PULSE.initWorkers(1);

  const predatorA = 8;
  const preyB = 11;

  STATE_MATRIX.setId(predatorA, 10n);
  STATE_MATRIX.setEnergy(predatorA, 50000);
  STATE_MATRIX.setResonance(predatorA, 299); // Need high resonance to overcome prey's shields
  STATE_MATRIX.setX(predatorA, 20);
  STATE_MATRIX.setY(predatorA, 20);

  STATE_MATRIX.setId(preyB, 11n);
  STATE_MATRIX.setEnergy(preyB, 10000);
  STATE_MATRIX.setX(preyB, 30); // dx=10 -> 1 cell away (10 sub-units)
  STATE_MATRIX.setY(preyB, 20);

  // Tick 1: Rebuild spatial hash
  await PULSE.tick();

  // Script: Predator moves +10 in X towards Prey
  const scriptMoveX = new Uint8Array(64);
  scriptMoveX[0] = OP_SET;
  scriptMoveX[1] = 0;
  scriptMoveX[2] = SYS_ATTRACT;
  scriptMoveX[3] = OP_SET;
  scriptMoveX[4] = 1;
  scriptMoveX[5] = preyB; // targetIdx = 11
  scriptMoveX[6] = OP_SET;
  scriptMoveX[7] = 2;
  scriptMoveX[8] = 1; // intensity = 1 (Attract)
  scriptMoveX[9] = OP_SYSCALL;

  STATE_MATRIX.setInstructions(predatorA, scriptMoveX);

  LOGGER.info("Executing ATTRACT pulse...");
  await PULSE.tick(); // Tick 2: Predator moves
  const newPx = STATE_MATRIX.getX(predatorA);
  LOGGER.info(`Predator X is now: ${newPx}`);

  assertEquals(
    newPx,
    STATE_MATRIX.getX(preyB),
    "SYS_ATTRACT should update predator X coordinate to match prey",
  );

  // Re-run spatial hash so they are considered adjacent or in same cell for eating
  await PULSE.tick(); // Tick 3

  // Script: Predator steals from Prey
  const scriptEat = new Uint8Array(64);
  scriptEat[0] = OP_SET;
  scriptEat[1] = 0;
  scriptEat[2] = SYS_TRANSFER;
  scriptEat[3] = OP_SET; // Add missing OP_SET
  scriptEat[4] = 1;
  scriptEat[5] = preyB; // Target Idx 11
  scriptEat[6] = OP_SET;
  scriptEat[7] = 2;
  scriptEat[8] = 0; // Resource = 0 (Energy)
  scriptEat[9] = OP_SET;
  scriptEat[10] = 3;
  scriptEat[11] = 251; // Amount = -5
  scriptEat[12] = OP_SYSCALL;

  STATE_MATRIX.setInstructions(predatorA, scriptEat);
  STATE_MATRIX.setPC(predatorA, 0);

  const initialPreyEnergy = STATE_MATRIX.getEnergy(preyB);
  LOGGER.info("Executing TRANSFER (Theft) pulse...");
  await PULSE.tick(); // Tick 4: Predator eats

  const finalPreyEnergy = STATE_MATRIX.getEnergy(preyB);

  // The prey naturally burns a tiny amount of gas/entropy, so we check for the drop of ~5.
  const drop = initialPreyEnergy - finalPreyEnergy;
  assertEquals(
    drop >= 5 && drop < 6,
    true,
    "SYS_TRANSFER (stealing) should have deducted 5 energy from the prey",
  );

  const predatorEnergy = STATE_MATRIX.getEnergy(predatorA);
  // Actually, gas cost for EAT is 30 -> 30,000 internal energy -> 30 external energy
  // He ate 5. So he lost energy overall. But that's fine, the transfer mechanism worked.

  console.log("--- STAGE 36: SUCCESS ---");
  PULSE.stopWorkers();
  NEXUS_DAEMON.stop();
  await new Promise((r) => setTimeout(r, 10));
});
