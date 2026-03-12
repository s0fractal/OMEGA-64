import { STATE_MATRIX } from "@00";
import { PULSE } from "@02";
import { ISA } from "@02";
import {
  assertAlmostEquals,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Era 48: Metabolic Balance - SENSE energy cost", async () => {
  PULSE.initWorkers();
  STATE_MATRIX.clear();

  const idx = 10;
  STATE_MATRIX.setId(idx, 100n);
  STATE_MATRIX.setX(idx, 100);
  STATE_MATRIX.setY(idx, 100);
  STATE_MATRIX.setEnergy(idx, 100);

  const neutralLogic = new Uint8Array([128, 128, 128, 128, 128, 128, 128, 128]);
  STATE_MATRIX.setLogic(idx, neutralLogic);

  const prog = new Uint32Array(16);
  prog[0] = 0x0000019F;
  STATE_MATRIX.setCode(idx, prog);

  const initialEnergy = STATE_MATRIX.getEnergy(idx);
  await PULSE.tick();
  const finalEnergy = STATE_MATRIX.getEnergy(idx);

  assertAlmostEquals(
    initialEnergy - finalEnergy,
    0.51,
    0.01,
    "SENSE should have a metabolic cost",
  );

  PULSE.stopWorkers();
});

Deno.test("Era 48: High-Density Friction - Reproduction cost", async () => {
  PULSE.initWorkers();
  STATE_MATRIX.clear();

  const neutralLogic = new Uint8Array([128, 128, 128, 128, 128, 128, 128, 128]);

  // 1. Sparse Scenario
  const sparseIdx = 20;
  STATE_MATRIX.setId(sparseIdx, 200n);
  STATE_MATRIX.setX(sparseIdx, 200);
  STATE_MATRIX.setY(sparseIdx, 200);
  STATE_MATRIX.setEnergy(sparseIdx, 200);
  STATE_MATRIX.setLogic(sparseIdx, neutralLogic);

  const progSparse = new Uint32Array(16);
  progSparse[0] = 0x0000009A;
  STATE_MATRIX.setCode(sparseIdx, progSparse);

  await PULSE.tick();
  const sparseEnergyDelta = 200 - STATE_MATRIX.getEnergy(sparseIdx);
  console.log(`   [TEST] Sparse Repro Energy Delta: ${sparseEnergyDelta}`);

  // 2. Dense Scenario
  const dx = 505;
  const dy = 505;
  const denseIdx = 50;
  STATE_MATRIX.setId(denseIdx, 300n);
  STATE_MATRIX.setX(denseIdx, dx);
  STATE_MATRIX.setY(denseIdx, dy);
  STATE_MATRIX.setEnergy(denseIdx, 300);
  STATE_MATRIX.setLogic(denseIdx, neutralLogic);

  const progDense = new Uint32Array(16);
  progDense[0] = 0x0003049F; // SENSE Density -> R3
  progDense[1] = 0x0000009A; // SELF_REP
  STATE_MATRIX.setCode(denseIdx, progDense);

  // LARGER SEEDING BLOCK (11x11 cells)
  let neighborCount = 0;
  for (let ox = -5; ox <= 5; ox++) {
    for (let oy = -5; oy <= 5; oy++) {
      const cx = 50 + ox;
      const cy = 50 + oy;
      for (let i = 0; i < 15; i++) {
        const nIdx = 1000 + neighborCount++;
        if (nIdx >= 100000) break;
        STATE_MATRIX.setId(nIdx, BigInt(nIdx + 100));
        STATE_MATRIX.setX(nIdx, cx * 10 + 5);
        STATE_MATRIX.setY(nIdx, cy * 10 + 5);
        STATE_MATRIX.setEnergy(nIdx, 100);
        STATE_MATRIX.setLogic(nIdx, neutralLogic);
      }
    }
  }

  await PULSE.tick();
  const context1 = STATE_MATRIX.getContext(denseIdx);
  console.log(`   [TEST] Density sensed by VM in Tick 1: ${context1[5]}`);

  const energyBeforeRepro = STATE_MATRIX.getEnergy(denseIdx);
  await PULSE.tick();
  const energyAfterRepro = STATE_MATRIX.getEnergy(denseIdx);
  const denseEnergyDelta = energyBeforeRepro - energyAfterRepro;

  console.log(`   [TEST] Dense Repro Energy Delta: ${denseEnergyDelta}`);

  assertAlmostEquals(
    sparseEnergyDelta,
    80.01,
    0.05,
    "Sparse reproduction should cost base amount",
  );
  assertAlmostEquals(
    denseEnergyDelta,
    130.01,
    1.0,
    "Dense reproduction should cost significantly more",
  );

  PULSE.stopWorkers();
});
