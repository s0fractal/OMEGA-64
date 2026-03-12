// OMEGA-64 | test_atomic_ledger.ts | Stage 33 Verification
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { RISC, STATE_MATRIX, SYS } from "@00";
import { PULSE } from "@02";
import { LOGGER } from "@00";
import { ATOMIC_LEDGER } from "@03";

Deno.test("Stage 33: Binary Event Ledger (SYS_EMIT)", async () => {
  LOGGER.info("--- STAGE 33: ATOMIC LEDGER TEST ---");

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.syncState, 0, 0);
  Atomics.store(STATE_MATRIX.tickCounter, 0, 42);
  await PULSE.initWorkers(1);

  const atomA = 10;
  const atomB = 11;

  STATE_MATRIX.setId(atomA, 10n);
  STATE_MATRIX.setEnergy(atomA, 1000);

  STATE_MATRIX.setId(atomB, 11n);
  STATE_MATRIX.setEnergy(atomB, 1000);

  // Atom A emits [9, 120]
  const scriptA = new Uint8Array(64);
  scriptA[0] = RISC.OP_SET;
  scriptA[1] = 0;
  scriptA[2] = SYS.EMIT;
  scriptA[3] = RISC.OP_SET;
  scriptA[4] = 1;
  scriptA[5] = 9; // R1
  scriptA[6] = RISC.OP_SET;
  scriptA[7] = 2;
  scriptA[8] = 120; // R2
  scriptA[9] = RISC.OP_SYSCALL;
  scriptA[10] = 0;
  STATE_MATRIX.setInstructions(atomA, scriptA);

  // Atom B emits [123, 200]
  const scriptB = new Uint8Array(64);
  scriptB[0] = RISC.OP_SET;
  scriptB[1] = 0;
  scriptB[2] = SYS.EMIT;
  scriptB[3] = RISC.OP_SET;
  scriptB[4] = 1;
  scriptB[5] = 123; // R1
  scriptB[6] = RISC.OP_SET;
  scriptB[7] = 2;
  scriptB[8] = 200; // R2
  scriptB[9] = RISC.OP_SYSCALL;
  scriptB[10] = 0;
  STATE_MATRIX.setInstructions(atomB, scriptB);

  // Ensure Ledger is empty at the start
  assertEquals(ATOMIC_LEDGER.getHead(), 0, "Ledger should start empty");

  LOGGER.info("Executing ledger emit pulse...");
  await PULSE.tick();

  const head = ATOMIC_LEDGER.getHead();
  LOGGER.info(`Ledger Head after pulse: 0 -> ${head}`);
  assertEquals(head, 2, "Both atoms should have emitted successfully");

  const events = ATOMIC_LEDGER.readRange(0, head);
  LOGGER.info(
    `Event 1: Atom ${events[0].atomIdx} at Tick ${events[0].tick} -> [${
      events[0].r1
    }, ${events[0].r2}]`,
  );
  LOGGER.info(
    `Event 2: Atom ${events[1].atomIdx} at Tick ${events[1].tick} -> [${
      events[1].r1
    }, ${events[1].r2}]`,
  );

  // We don't guarantee the exact order between 10 and 11, but both events must be in there.
  const hasEventA = events.some((e) =>
    e.atomIdx === atomA && e.r1 === 9 && e.r2 === 120 && e.tick === 42
  );
  const hasEventB = events.some((e) =>
    e.atomIdx === atomB && e.r1 === 123 && e.r2 === 200 && e.tick === 42
  );

  assertEquals(hasEventA, true, "Event A must be in the ledger");
  assertEquals(hasEventB, true, "Event B must be in the ledger");

  // Verify binary export length
  const binaryDump = ATOMIC_LEDGER.exportBinary();
  const EXPECTED_SIZE = 4 + (65536 * 16);
  assertEquals(
    binaryDump.byteLength,
    EXPECTED_SIZE,
    "Binary dump should match exactly the head + 64K event payload",
  );

  // Wait, in RISC.OP_SET, a value of 777 or 888 won't fit a 1-byte literal!
  // Ah! RISC.OP_SET writes a single byte (0-255).
  // R1 holding "777" is impossible with a direct OP_SET literal.
  // We need numbers under 255.
  // I will revise the test below, replacing 777/888 with 77/88.

  LOGGER.info("--- STAGE 33: SUCCESS ---");
  PULSE.stopWorkers();
});
