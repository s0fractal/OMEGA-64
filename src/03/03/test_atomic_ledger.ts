// OMEGA-64 | test_atomic_ledger.ts | Stage 33 Verification
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { MX, LOGGER, Li } from "@generated";
import {
  PULSE
} from "@generated";

import {
  ATOMIC_LEDGER
} from "@generated";
import {
  OP_SET,
  SYS_EMIT,
  OP_SYSCALL
} from "@generated";

Deno.test("Stage 33: Binary Event Ledger (SYS_EMIT)", async () => {
  Li("--- STAGE 33: ATOMIC LEDGER TEST ---");

  MX.clear();
  Atomics.store(MX.syncState, 0, 0);
  Atomics.store(MX.tickCounter, 0, 42);
  await PULSE.initWorkers(1);

  const atomA = 10;
  const atomB = 11;

  MX.setId(atomA, 10n);
  MX.setEnergy(atomA, 1000);

  MX.setId(atomB, 11n);
  MX.setEnergy(atomB, 1000);

  // Atom A emits [9, 120]
  const scriptA = new Uint8Array(64);
  scriptA[0] = OP_SET;
  scriptA[1] = 0;
  scriptA[2] = SYS_EMIT;
  scriptA[3] = OP_SET;
  scriptA[4] = 1;
  scriptA[5] = 9; // R1
  scriptA[6] = OP_SET;
  scriptA[7] = 2;
  scriptA[8] = 120; // R2
  scriptA[9] = OP_SYSCALL;
  scriptA[10] = 0;
  MX.setInstructions(atomA, scriptA);

  // Atom B emits [123, 200]
  const scriptB = new Uint8Array(64);
  scriptB[0] = OP_SET;
  scriptB[1] = 0;
  scriptB[2] = SYS_EMIT;
  scriptB[3] = OP_SET;
  scriptB[4] = 1;
  scriptB[5] = 123; // R1
  scriptB[6] = OP_SET;
  scriptB[7] = 2;
  scriptB[8] = 200; // R2
  scriptB[9] = OP_SYSCALL;
  scriptB[10] = 0;
  MX.setInstructions(atomB, scriptB);

  // Ensure Ledger is empty at the start
  assertEquals(ATOMIC_LEDGER.getHead(), 0, "Ledger should start empty");

  Li("Executing ledger emit pulse...");
  await PULSE.tick();

  const head = ATOMIC_LEDGER.getHead();
  Li(`Ledger Head after pulse: 0 -> ${head}`);
  assertEquals(head, 2, "Both atoms should have emitted successfully");

  const events = ATOMIC_LEDGER.readRange(0, head);
  Li(
    `Event 1: Atom ${events[0].atomIdx} at Tick ${events[0].tick} -> [${
      events[0].r1
    }, ${events[0].r2}]`,
  );
  Li(
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

  Li("--- STAGE 33: SUCCESS ---");
  PULSE.stopWorkers();
});
