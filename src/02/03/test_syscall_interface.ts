import { GRID_W, GRID_H , GRID_CELLS} from "../../_/mod.ts";
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { PULSE } from "@02";
import {
  CONTEXT_OFFSET,
  STRUCTURE_GRID_OFFSET
} from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { energyBuffer, idBuffer, RISC, STATE_MATRIX, structureGridBuffer, SYS } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

Deno.test({
  name: "Universal Syscall - WRITE_MEM / READ_MEM execution correctness",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    // 0. BYPASS STARTUP SELF-TEST
    STATE_MATRIX.seedAtom(13999, 1n, 0, 0, 0, 0);

    await PULSE.initWorkers(1); // 1 worker is enough for test

    const atomIdx = 100;

    const code = new Uint8Array(64);
    let c = 0;
    // Syscall 1: SYS_WRITE_MEM to target location
    code[c++] = RISC.OP_SET;
    code[c++] = 0;
    code[c++] = SYS.WRITE_MEM;
    code[c++] = RISC.OP_SET;
    code[c++] = 1;
    code[c++] = 50;
    code[c++] = RISC.OP_SET;
    code[c++] = 2;
    code[c++] = 50;
    code[c++] = RISC.OP_SET;
    code[c++] = 3;
    code[c++] = 4; // 4 = STR_SOURCE, immune to decay
    code[c++] = RISC.OP_SYSCALL;

    // Syscall 2: SYS_READ_MEM from the target location into R0
    code[c++] = RISC.OP_SET;
    code[c++] = 0;
    code[c++] = SYS.READ_MEM;
    code[c++] = RISC.OP_SET;
    code[c++] = 1;
    code[c++] = 50;
    code[c++] = RISC.OP_SET;
    code[c++] = 2;
    code[c++] = 50;
    // we do not need R3 for READ_MEM
    code[c++] = RISC.OP_SYSCALL;

    STATE_MATRIX.seedAtom(
      atomIdx,
      100n,
      100,
      100,
      1000,
      500,
      new Uint8Array(8),
      code,
    );
    STATE_MATRIX.setPC(atomIdx, 0);

    // Pulse to execute VM and Syscall Intent
    await PULSE.tick();

    // Pulse again to apply intents globally
    await PULSE.tick();

    const structureGrid = new Int32Array(
      STATE_MATRIX.buffer,
      STRUCTURE_GRID_OFFSET,
      GRID_CELLS,
    );
    const targetIdx = 50 * GRID_W + 50;

    assertEquals(
      structureGrid[targetIdx] & 0xFF,
      4,
      "WRITE_MEM should write STR_SOURCE (4) to grid without it decaying",
    );

    const contextData = new Int32Array(
      STATE_MATRIX.buffer,
      CONTEXT_OFFSET,
      16 * 14000,
    );
    const r0 = contextData[atomIdx * 16 + 0];
    assertEquals(
      r0,
      4,
      "READ_MEM should return the value written to the grid into R0",
    );

    PULSE.stopWorkers();
  },
});
