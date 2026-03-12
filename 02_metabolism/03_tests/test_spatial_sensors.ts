// OMEGA-64 | test_spatial_sensors.ts | Stage 35 Verification
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { RISC, STATE_MATRIX, SYS } from "../../00_substrate/mod.ts";
import { PULSE } from "../../02_metabolism/mod.ts";
import { LOGGER } from "../../00_substrate/mod.ts";

Deno.test("Stage 35: Spatial Sensors (SYS_SCAN)", async () => {
  LOGGER.info("--- STAGE 35: SPATIAL SENSORS TEST ---");

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.syncState, 0, 0);
  Atomics.store(STATE_MATRIX.tickCounter, 0, 100);
  await PULSE.initWorkers(1);

  const atomA = 10; // Scanner
  const atomB = 11; // Target 1 (Close)
  const atomC = 12; // Target 2 (Far)

  STATE_MATRIX.setId(atomA, 10n);
  STATE_MATRIX.setEnergy(atomA, 50000);
  STATE_MATRIX.setX(atomA, 20);
  STATE_MATRIX.setY(atomA, 20);

  STATE_MATRIX.setId(atomB, 11n);
  STATE_MATRIX.setEnergy(atomB, 1000);
  STATE_MATRIX.setX(atomB, 21); // dx=1, dy=0 -> sq=1
  STATE_MATRIX.setY(atomB, 20);

  STATE_MATRIX.setId(atomC, 12n);
  STATE_MATRIX.setEnergy(atomC, 1000);
  STATE_MATRIX.setX(atomC, 28); // dx=8, dy=0 -> sq=64
  STATE_MATRIX.setY(atomC, 20);

  // We need to force a spatial hash rebuild so PULSE_WORKER can see them
  // PULSE usually does this during initialization tick.
  await PULSE.tick(); // Tick 1: Rebuilds spatial hash. Atom A does nothing, B nothing, C nothing.

  // Now we set the script for Atom A to do SYS_SCAN with radius 5
  // Atom A emits the target index using SYS.EMIT for us to verify
  const scriptA = new Uint8Array(64);
  scriptA[0] = RISC.OP_SET;
  scriptA[1] = 0;
  scriptA[2] = SYS.SCAN; // R0 = SysId (SYS_SCAN)
  scriptA[3] = RISC.OP_SET;
  scriptA[4] = 1;
  scriptA[5] = 5; // R1 = Radius (5)
  scriptA[6] = RISC.OP_SYSCALL;
  scriptA[7] = 0; // execute SYS_SCAN. Result in R0.
  // emit R0 (targetIdx)
  scriptA[8] = RISC.OP_SET;
  scriptA[9] = 1;
  scriptA[10] = SYS.EMIT; // Wait, R0 holds result. We need R1=sys_emit, but opcode is in R0.
  // Actually, SYS_SCAN puts result into R0.
  // So R0 = closestIdx.
  // Let's do OP_REGCOPY to move R0 to R2 (R2=r2 for SYS_EMIT)
  // OP_REGCOPY is 0x11 ? Let's check RISC ISA.
  // It's easier to just read the context manually via STATE_MATRIX!
  STATE_MATRIX.setInstructions(atomA, scriptA);

  LOGGER.info("Executing scan pulse...");
  await PULSE.tick(); // Tick 2: Atom A executes SCAN

  // The result of the syscall is stored in R0 (context offset 0)
  const contextA = new Int32Array(
    STATE_MATRIX.buffer,
    STATE_MATRIX.contexts.byteOffset + atomA * 64,
    16,
  );
  const foundIdx = contextA[0]; // R0

  LOGGER.info(`Atom A scanned radius 5, found closest Idx: ${foundIdx}`);
  assertEquals(
    foundIdx,
    atomB,
    "SYS_SCAN should find Atom B (Idx 11) because it is within radius 5",
  );

  // Verify finding no one
  STATE_MATRIX.setX(atomA, 50);
  STATE_MATRIX.setY(atomA, 50);
  // Re-run spatial hash rebuild tick
  const scriptA_nop = new Uint8Array(64);
  scriptA_nop[0] = RISC.OP_NOP;
  STATE_MATRIX.setInstructions(atomA, scriptA_nop);
  await PULSE.tick(); // Rebuild hash where atom A is at 50,50 and nobody is near.

  STATE_MATRIX.setInstructions(atomA, scriptA); // Reload SYS_SCAN script
  STATE_MATRIX.setPC(atomA, 0); // Reset Program Counter!
  const contextA_prep = new Int32Array(
    STATE_MATRIX.buffer,
    STATE_MATRIX.contexts.byteOffset + atomA * 64,
    16,
  );
  contextA_prep[0] = 0; // clear R0

  await PULSE.tick();
  const contextA_empty = new Int32Array(
    STATE_MATRIX.buffer,
    STATE_MATRIX.contexts.byteOffset + atomA * 64,
    16,
  );
  const notFoundIdx = contextA_empty[0]; // R0
  LOGGER.info(
    `Atom A scanned radius 5 at (50,50), found closest Idx: ${notFoundIdx}`,
  );
  assertEquals(
    notFoundIdx,
    -1,
    "SYS_SCAN should return -1 when no valid atoms are within radius",
  );

  LOGGER.info("--- STAGE 35: SUCCESS ---");
  PULSE.stopWorkers();
});
