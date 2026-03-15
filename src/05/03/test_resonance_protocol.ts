import { GRID_W, GRID_H, GRID_CELLS } from "@generated";
import { STATE_MATRIX } from "@generated";
import { PULSE } from "@02";
import { SOVEREIGN_ORACLE } from "@05";
import { NEURAL_COHERENCE_OFFSET, STRUCTURE_GRID_OFFSET } from "@generated";

async function testResonance() {
  console.log("💎 [TEST] Resonance Protocol Verification...");

  // 1. Setup
  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.syncState, 0, 0); // Ensure IDLE (0)
  Atomics.store(STATE_MATRIX.tickCounter, 0, 1); // Skip Gate audit on first probe tick
  await PULSE.initWorkers();

  const sharedBuffer = STATE_MATRIX.buffer;
  const structureGrid = new Int32Array(
    sharedBuffer,
    STRUCTURE_GRID_OFFSET,
    GRID_CELLS,
  );
  const neuralCoherenceView = new Int32Array(
    sharedBuffer,
    NEURAL_COHERENCE_OFFSET,
    1,
  );

  // 2. Seed Guardian
  const guardianIdx = 0;
  STATE_MATRIX.seedGuardian(guardianIdx, 1n, 505, 505, 10, 100);

  // 3. Force Low Coherence
  Atomics.store(neuralCoherenceView, 0, 50);
  console.log(
    "   [STAGE 1] Low Coherence set: 50/255. Guardian should switch to ARCHITECT (Role 3).",
  );

  // 4. Run Pulse
  await PULSE.tick();

  const role = STATE_MATRIX.getRole(guardianIdx);
  console.log(`   [RESULT 1] Guardian Role: ${role} (Expected 3: ARCHITECT)`);
  if (role !== 3) {
    throw new Error(`Guardian did not switch to ARCHITECT. got=${role}`);
  }

  // 5. Test Autopoiesis
  console.log(
    "   [STAGE 2] Testing Autopoiesis: Injecting high charge into Structure Grid.",
  );
  const gx = 10;
  const gy = 10;
  const cellIdx = gy * GRID_W + gx;
  const neighborIdx = gy * GRID_W + gx + 1;
  // Set neighbor to high charge (Type 1 WIRE, Charge 251, State 1)
  // Autopoiesis triggers at charge > 100
  Atomics.store(structureGrid, neighborIdx, (1 << 24) | (251 << 16) | 1);

  // Run two pulses for structural propagation
  await PULSE.tick();
  await PULSE.tick();

  const cellValue = Atomics.load(structureGrid, cellIdx);
  const cellType = cellValue & 0xFF;
  console.log(
    `   [RESULT 2] Autopoietic Cell (10,10) Type: ${cellType} (Expected 1: WIRE)`,
  );
  if (cellType !== 1) {
    throw new Error(`Autopoiesis failed. got cellType=${cellType}`);
  }

  // 6. Test Oracle Whisper Channel
  console.log(
    "   [STAGE 3] Testing Oracle Whisper injection into MEMORY_GRID.",
  );
  const memoryGrid = STATE_MATRIX.memoryGrid;
  const countSeededCells = () => {
    let count = 0;
    for (let i = 0; i < GRID_CELLS; i++) {
      const base = i * 8;
      if (memoryGrid[base] !== 0 || memoryGrid[base + 1] !== 0) count++;
    }
    return count;
  };
  const beforeSeeds = countSeededCells();
  SOVEREIGN_ORACLE.broadcastWhisper(100, { matrixResonance: 9000 }, 300);
  const drainStats = SOVEREIGN_ORACLE.drainPendingMutations();
  const afterSeeds = countSeededCells();
  console.log(
    `   [RESULT 3a] Oracle drain applied=${drainStats.applied} skipped=${drainStats.skipped}`,
  );
  console.log(
    `   [RESULT 3] Whisper-seeded cells delta: ${
      afterSeeds - beforeSeeds
    } (Expected > 0)`,
  );
  if (afterSeeds <= beforeSeeds) {
    throw new Error("Oracle whisper did not seed MEMORY_GRID.");
  }

  console.log("💎 [TEST] Resonance Protocol Verification Done.");
  Deno.exit(0);
}

testResonance();
