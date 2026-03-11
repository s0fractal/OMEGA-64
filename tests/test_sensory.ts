import { STATE_MATRIX } from "../00_substrate/mod.ts";
import { PULSE } from "../02_metabolism/mod.ts";
import { ISA } from "../02_metabolism/mod.ts";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PHYSICS_ENGINE } from "../01_physics/mod.ts";
import { SPATIAL_HASH } from "../01_physics/mod.ts";

Deno.test("Era 47: Sensory Transduction - Full Multi-Modal Suite", async () => {
  // 1. Setup
  PULSE.initWorkers();

  // Reset State
  STATE_MATRIX.clear();

  const idx = 100;
  const idx2 = 101;
  const x = 505;
  const y = 405;
  const gx = 50;
  const gy = 40;
  const gridIdx = gy * 140 + gx;

  // Atom 1 (The Sensor)
  STATE_MATRIX.setId(idx, 100n);
  STATE_MATRIX.setX(idx, x);
  STATE_MATRIX.setY(idx, y);
  STATE_MATRIX.setEnergy(idx, 100);
  STATE_MATRIX.setResonance(idx, 50);

  // Atom 2 (The Neighbor to be sensed in Population Density)
  STATE_MATRIX.setId(idx2, 101n);
  STATE_MATRIX.setX(idx2, x + 1);
  STATE_MATRIX.setY(idx2, y + 1);

  // Global Seeding for basic tests to avoid drift
  new Int32Array(PHYSICS_ENGINE.envBuffer).fill(123);
  STATE_MATRIX.structureGrid.fill((210 << 8) | 1);

  // Target Seeding for Viral intensity
  Atomics.store(STATE_MATRIX.viralGrid, gridIdx * 9 + 8, 42);

  // Bytecode:
  // SENSE 0x01, Reg0 (Nutrients)
  // SENSE 0x02, Reg1 (Structures)
  // SENSE 0x03, Reg2 (Viral)
  // SENSE 0x04, Reg3 (Spatial)
  const prog = new Uint32Array(16);
  prog[0] = 0x0000019F; // SENSE 1 -> R0
  prog[1] = 0x0001029F; // SENSE 2 -> R1
  prog[2] = 0x0002039F; // SENSE 3 -> R2
  prog[3] = 0x0003049F; // SENSE 4 -> R3

  STATE_MATRIX.setCode(idx, prog);

  // 2. Execute Ticks
  await PULSE.tick();
  await PULSE.tick();
  await PULSE.tick();
  await PULSE.tick();

  // 3. Verify Registers
  const context = STATE_MATRIX.getContext(idx);
  const r0 = context[2];
  const r1 = context[3];
  const r2 = context[4];
  const r3 = context[5];

  console.log(`   [TEST] Nutrients sensed: ${r0} (Expected: 123)`);
  console.log(`   [TEST] Structure density sensed: ${r1} (Expected: 210)`);
  console.log(`   [TEST] Viral intensity sensed: ${r2} (Expected: 42)`);
  console.log(`   [TEST] Population density sensed: ${r3} (Expected: 2)`);

  assertEquals(r0, 123, "Should sense correct nutrients");
  assertEquals(r1, 210, "Should sense correct structure density");
  assertEquals(r2, 42, "Should sense correct viral intensity");
  assertEquals(
    r3,
    2,
    "Should sense correct population density (Self + 1 Neighbor)",
  );

  PULSE.stopWorkers();
});
