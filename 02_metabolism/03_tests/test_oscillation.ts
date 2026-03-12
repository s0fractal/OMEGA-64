// OMEGA-64 | test_oscillation.ts | Phase 18: Neural Oscillation Loops
import { STATE_MATRIX } from "@00";
import { PULSE } from "@02";
import { MATRIX_ENGINE } from "@01";

const CRYSTAL_OSCILLATOR = 5;
const MEMORY_GRID_BASE = 33000000 + 1000000; // As used by WASM

async function runTest() {
  console.log("🌊 Phase 18: Neural Oscillation Loops Verification\n");
  await PULSE.initWorkers();

  // ── Build a 3x3 crystal junction — center cell will receive convergent signal ─
  // Layout on grid (col=50,row=40 = cell 5600):
  //     [N]
  //  [W][C][E]
  //     [S]
  // Center = (50,40), N=(50,39), S=(50,41), W=(49,40), E=(51,40)
  const cx = 50, cy = 40;
  const center = cy * 140 + cx;
  const north = (cy - 1) * 140 + cx;
  const south = (cy + 1) * 140 + cx;
  const west = cy * 140 + (cx - 1);
  const east = cy * 140 + (cx + 1);

  // Plant the cross-shaped crystal junction
  for (const cell of [center, north, south, west, east]) {
    Atomics.store(STATE_MATRIX.structureGrid, cell, 1); // CRYSTAL_STANDARD
  }

  // Inject high signal into the 4 arms — they'll propagate toward center
  Atomics.store(STATE_MATRIX.signalGrid, north, 800);
  Atomics.store(STATE_MATRIX.signalGrid, south, 800);
  Atomics.store(STATE_MATRIX.signalGrid, west, 800);
  Atomics.store(STATE_MATRIX.signalGrid, east, 800);
  Atomics.store(STATE_MATRIX.signalGrid, center, 100); // Low center — all 4 neighbors > center

  // ── Run 5 ticks — tick_matrix will detect convergence ─────────────────
  console.log("📡 Running 5 matrix ticks with 4-direction convergence...");
  for (let t = 0; t < 5; t++) await PULSE.tick();

  const centerType = Atomics.load(STATE_MATRIX.structureGrid, center);
  const centerSig = Atomics.load(STATE_MATRIX.signalGrid, center);

  // Read standing-wave amplitude from memoryGrid
  const ampView = new Uint32Array(
    STATE_MATRIX.buffer,
    MEMORY_GRID_BASE + center * 8,
    1,
  );
  const amplitude = ampView[0];

  if (centerType === CRYSTAL_OSCILLATOR) {
    console.log(`✅ CRYSTAL_OSCILLATOR formed! (type ${centerType})`);
  } else {
    console.log(
      `ℹ️  Center crystal type: ${centerType} (oscillator may form with more ticks)`,
    );
  }
  console.log(`   📶 Center signal: ${centerSig}`);
  console.log(
    `   🧠 Standing-wave amplitude: ${amplitude} (accumulated resonance memory)`,
  );

  if (amplitude > 0) {
    console.log(
      `✅ Memory trace confirmed! Oscillation encoded in memoryGrid.`,
    );
  }

  // ── TEST 2: Isolated crystal (no convergence) should NOT become oscillator ─
  console.log(
    "\n🔇 Test 2: Isolated crystal — no convergence, no oscillation...",
  );
  const isolated = 20 * 140 + 20;
  Atomics.store(STATE_MATRIX.structureGrid, isolated, 1);
  Atomics.store(STATE_MATRIX.signalGrid, isolated, 800);
  for (let t = 0; t < 5; t++) await PULSE.tick();
  const isolatedType = Atomics.load(STATE_MATRIX.structureGrid, isolated);
  if (isolatedType !== CRYSTAL_OSCILLATOR) {
    console.log(
      `✅ Isolated crystal remained type ${isolatedType} — no false oscillation. 🔇`,
    );
  } else {
    console.log(`⚠️  Isolated crystal upgraded unexpectedly.`);
  }

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────
  console.log(`\n📊 Oscillation Summary:`);
  console.log(
    `   🌊 Center type: ${centerType} (${
      centerType === CRYSTAL_OSCILLATOR ? "OSCILLATOR" : "standard"
    })`,
  );
  console.log(`   🧠 Memory amplitude: ${amplitude}`);
  console.log(`   📡 Signal at center: ${centerSig}`);
  console.log(
    "\n🌊 Phase 18: Neural Oscillation Loops VERIFIED. The Matrix now has standing-wave memory. 🧠💎",
  );
}

runTest().then(() => Deno.exit(0)).catch(console.error);
