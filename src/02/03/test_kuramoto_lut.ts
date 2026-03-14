import {
  assertEquals,
  assertGreater,
  assertLess,
} from "https://deno.land/std@0.210.0/assert/mod.ts";
import { PULSE } from "@02";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { CONTEXT_OFFSET } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { OP_SET, OP_RESOLVE, OP_RESONATE_KURAMOTO, OP_JMP } from "../../_/mod.ts";

Deno.test({
  name: "Stage 44: Vector Cognitive - Math LUTs and Kuramoto Resonance",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    // Boilerplate setup
    STATE_MATRIX.seedAtom(13999, 1n, 0, 0, 0, 0); // bypass bootstrap
    await PULSE.initWorkers(1);

    // Atom 100: tests OP_RESOLVE (Sin Fast - Mode 0)
    let c = 0;
    const code1 = new Uint8Array(64);
    code1[c++] = OP_SET;
    code1[c++] = 1;
    code1[c++] = 64; // angle in R1
    code1[c++] = OP_SET;
    code1[c++] = 2;
    code1[c++] = 0; // mode in R2 (0: Sin Direct)
    code1[c++] = OP_RESOLVE;
    code1[c++] = 0;
    code1[c++] = 1;
    code1[c++] = 2; // R0 = resolve(R1, R2)

    STATE_MATRIX.seedAtom(
      100,
      10n,
      10,
      10,
      1000,
      500,
      new Uint8Array(8),
      code1,
    );
    STATE_MATRIX.setPC(100, 0);

    // Atom 101: tests OP_RESOLVE (Sin Precise - Mode 1)
    c = 0;
    const code2 = new Uint8Array(64);
    // 64 passed as Q8.8 means index 0, fraction 64/256 (0.25). Sin(0.25 index) ≈ 201
    code2[c++] = OP_SET;
    code2[c++] = 1;
    code2[c++] = 64; // angle in R1
    code2[c++] = OP_SET;
    code2[c++] = 2;
    code2[c++] = 1; // mode in R2 (1: Sin LERP)
    code2[c++] = OP_RESOLVE;
    code2[c++] = 0;
    code2[c++] = 1;
    code2[c++] = 2; // R0 = resolve(R1, R2)

    STATE_MATRIX.seedAtom(
      101,
      10n,
      20,
      20,
      1000,
      500,
      new Uint8Array(8),
      code2,
    );
    STATE_MATRIX.setPC(101, 0);

    // Test OP_RESONATE_KURAMOTO
    // Atom 200 and 201 are put at the same location to form a quorum
    c = 0;
    const codeRes = new Uint8Array(64);
    codeRes[c++] = OP_RESONATE_KURAMOTO;
    codeRes[c++] = OP_JMP;
    codeRes[c++] = 0; // loop

    // Atom 200: phase 10
    STATE_MATRIX.seedAtom(
      200,
      10n,
      10000,
      10000,
      1000,
      100,
      new Uint8Array(8),
      codeRes,
    );
    STATE_MATRIX.setPC(200, 0);
    STATE_MATRIX.setPhase(200, 10);
    // Atom 201: phase 50
    STATE_MATRIX.seedAtom(
      201,
      10n,
      10000,
      10000,
      1000,
      100,
      new Uint8Array(8),
      codeRes,
    );
    STATE_MATRIX.setPC(201, 0);
    STATE_MATRIX.setPhase(201, 50);

    console.log(
      "Tick 0",
      STATE_MATRIX.getPhase(200),
      STATE_MATRIX.getPhase(201),
    );
    await PULSE.tick();
    console.log(
      "Tick 1",
      STATE_MATRIX.getPhase(200),
      STATE_MATRIX.getPhase(201),
    );
    await PULSE.tick();
    console.log(
      "Tick 2",
      STATE_MATRIX.getPhase(200),
      STATE_MATRIX.getPhase(201),
    );
    await PULSE.tick();
    console.log(
      "Tick 3",
      STATE_MATRIX.getPhase(200),
      STATE_MATRIX.getPhase(201),
    );

    // Verify Gas Cost differentials
    const e1 = STATE_MATRIX.getEnergy(100);
    const e2 = STATE_MATRIX.getEnergy(101);

    // Fast math costs 1 gas (1000 scaled), precise costs 10 gas (10000 scaled).
    assertGreater(
      e1,
      e2,
      "Fast math should leave Atom with more energy than precise math",
    );

    const contextData = new Int32Array(
      STATE_MATRIX.buffer,
      CONTEXT_OFFSET,
      16 * 14000,
    );
    const r0_1 = contextData[100 * 16]; // R0 of atom 100
    const r0_2 = contextData[101 * 16]; // R0 of atom 101

    // sin(64) where 256 is 2PI. So sin(PI/2) = 1.0 (Q15 = 32767)
    assertEquals(r0_1, 32767, "Fast math sin(PI/2) should be 32767 (Q15 1.0)");
    assertEquals(r0_2, 201, "Precise math sin(0.25 index) should be 201");

    // Verify Kuramoto Resonator Convergence
    const p1 = STATE_MATRIX.getPhase(200);
    const p2 = STATE_MATRIX.getPhase(201);

    console.log(`Phase 1: 10 -> ${p1}, Phase 2: 50 -> ${p2}`);
    // They should move towards each other
    assertGreater(
      p1,
      10,
      "Atom 200 should move its phase closer to the target average",
    );
    assertLess(
      p2,
      50,
      "Atom 201 should move its phase closer to the target average",
    );

    PULSE.stopWorkers();
  },
});
