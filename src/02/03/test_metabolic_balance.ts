import { MX } from "@g";
import { PULSE } from "@g";
import { ISA } from "@g";
import {
  assertAlmostEquals,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Era 48: Metabolic Balance - SENSE energy cost", async () => {
  PULSE.initWorkers();
  MX.clear();

  const idx = 10;
  MX.setId(idx, 100n);
  MX.setX(idx, 100);
  MX.setY(idx, 100);
  MX.setEnergy(idx, 100);

  const neutralLogic = new Uint8Array([128, 128, 128, 128, 128, 128, 128, 128]);
  MX.setLogic(idx, neutralLogic);

  const prog = new Uint32Array(16);
  prog[0] = 0x0000019F;
  MX.setCode(idx, prog);

  const initialEnergy = MX.getEnergy(idx);
  await PULSE.tick();
  const finalEnergy = MX.getEnergy(idx);

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
  MX.clear();

  const neutralLogic = new Uint8Array([128, 128, 128, 128, 128, 128, 128, 128]);

  // 1. Sparse Scenario
  const sparseIdx = 20;
  MX.setId(sparseIdx, 200n);
  MX.setX(sparseIdx, 200);
  MX.setY(sparseIdx, 200);
  MX.setEnergy(sparseIdx, 200);
  MX.setLogic(sparseIdx, neutralLogic);

  const progSparse = new Uint32Array(16);
  progSparse[0] = 0x0000009A;
  MX.setCode(sparseIdx, progSparse);

  await PULSE.tick();
  const sparseEnergyDelta = 200 - MX.getEnergy(sparseIdx);
  console.log(`   [TEST] Sparse Repro Energy Delta: ${sparseEnergyDelta}`);

  // 2. Dense Scenario
  const dx = 505;
  const dy = 505;
  const denseIdx = 50;
  MX.setId(denseIdx, 300n);
  MX.setX(denseIdx, dx);
  MX.setY(denseIdx, dy);
  MX.setEnergy(denseIdx, 300);
  MX.setLogic(denseIdx, neutralLogic);

  const progDense = new Uint32Array(16);
  progDense[0] = 0x0003049F; // SENSE Density -> R3
  progDense[1] = 0x0000009A; // SELF_REP
  MX.setCode(denseIdx, progDense);

  // LARGER SEEDING BLOCK (11x11 cells)
  let neighborCount = 0;
  for (let ox = -5; ox <= 5; ox++) {
    for (let oy = -5; oy <= 5; oy++) {
      const cx = 50 + ox;
      const cy = 50 + oy;
      for (let i = 0; i < 15; i++) {
        const nIdx = 1000 + neighborCount++;
        if (nIdx >= 100000) break;
        MX.setId(nIdx, BigInt(nIdx + 100));
        MX.setX(nIdx, cx * 10 + 5);
        MX.setY(nIdx, cy * 10 + 5);
        MX.setEnergy(nIdx, 100);
        MX.setLogic(nIdx, neutralLogic);
      }
    }
  }

  await PULSE.tick();
  const context1 = MX.getContext(denseIdx);
  console.log(`   [TEST] Density sensed by VM in Tick 1: ${context1[5]}`);

  const energyBeforeRepro = MX.getEnergy(denseIdx);
  await PULSE.tick();
  const energyAfterRepro = MX.getEnergy(denseIdx);
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
