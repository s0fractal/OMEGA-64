import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { PULSE } from "@02";
import * as OFFSETS from "@00";
import { RISC, STATE_MATRIX } from "@00";

Deno.test({
  name: "Bounded Compute - Gas Economy halts VM execution",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    // 0. BYPASS STARTUP SELF-TEST
    STATE_MATRIX.seedAtom(13999, 1n, 0, 0, 0, 0);

    await PULSE.initWorkers(1);

    const atomIdx = 100;
    const initialEnergy = 0.5; // 500 raw energy (enough for 5 ticks of 100 gas)

    const code = new Uint8Array(64);
    let c = 0;
    // Infinite loop:
    // 0: ADD R1, R1  (Cost: 1 gas, PC: 0 -> 3)
    // 3: JMP 0       (Cost: 2 gas, PC: 3 -> 0)
    // Total cost per iteration: 3 Gas

    code[0] = RISC.OP_ADD;
    code[1] = 1;
    code[2] = 1;
    code[3] = RISC.OP_JMP;
    code[4] = 0;

    STATE_MATRIX.seedAtom(
      atomIdx,
      100n,
      100,
      100,
      initialEnergy,
      500,
      new Uint8Array(8),
      code,
    );
    STATE_MATRIX.setPC(atomIdx, 0);

    // Pulse to execute VM. It should consume ~100 gas.
    await PULSE.tick();

    const contextData = new Int32Array(
      STATE_MATRIX.buffer,
      OFFSETS.CONTEXT_OFFSET,
      16 * 14000,
    );
    const pc = Atomics.load(
      new Int32Array(
        STATE_MATRIX.buffer,
        OFFSETS.CONTEXT_OFFSET + 32,
        14000 * 16,
      ),
      atomIdx,
    );

    const energyAfter1Tick = STATE_MATRIX.getEnergy(atomIdx);
    console.log(`[TEST] Energy after 1 tick: ${energyAfter1Tick}`);
    assertEquals(
      energyAfter1Tick < initialEnergy,
      true,
      "Energy should explicitly be depleted by execution cost",
    );

    // Keep ticking until out of gas. 5 ticks should be enough since 100 raw energy is consumed per tick.
    for (let i = 0; i < 5; i++) {
      await PULSE.tick();
    }

    const finalEnergy = STATE_MATRIX.getEnergy(atomIdx);
    console.log(
      `[TEST] PC: ${STATE_MATRIX.getPC(atomIdx)}, Final Energy: ${finalEnergy}`,
    );

    assertEquals(
      finalEnergy === 0,
      true,
      "Energy should be completely depleted resulting in OOG halt",
    );

    PULSE.stopWorkers();
  },
});
