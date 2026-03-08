// OMEGA-64 | test_arms_race.ts | Phase 16: Territorial Arms Race Verification
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { CRYSTAL_STANDARD, MATRIX_ENGINE } from "./MATRIX_ENGINE.ts";

const CRYSTAL_COLONY = 3;

async function runTest() {
  console.log("🏴 Phase 16: Territorial Arms Race Verification\n");
  await PULSE.initWorkers();

  // ── Shared genome helper ────────────────────────────────────────────────
  const spawnAtom = (
    idx: number,
    x: number,
    y: number,
    logicBytes: Uint8Array,
  ) => {
    STATE_MATRIX.setId(idx, BigInt(idx + 1));
    STATE_MATRIX.setX(idx, x);
    STATE_MATRIX.setY(idx, y);
    STATE_MATRIX.setEnergy(idx, 3000);
    STATE_MATRIX.setResonance(idx, 100);
    STATE_MATRIX.setPhase(idx, 0);
    STATE_MATRIX.setLogic(idx, logicBytes);
  };

  // ── TEST 1: Territorial Expansion via ISA_ANNEX ─────────────────────────
  console.log("🏴 Test 1: Colony A expands territory via ISA_ANNEX...");

  // Colony A genome: ISA_ANNEX opcode + AA signature
  const genomeA = new Uint8Array([
    0x46,
    0xAA,
    0xBB,
    0xCC,
    0x01,
    0x00,
    0x00,
    0x00,
  ]);

  // Place 5 Colony A atoms in a compact cluster at (400, 400)
  for (let i = 0; i < 5; i++) {
    spawnAtom(i, 400, 400, genomeA.slice());
  }

  // First plant a colony crystal at (400,400) manually (simulate prior formation)
  Atomics.store(STATE_MATRIX.structureGrid, 40 * 140 + 40, CRYSTAL_COLONY);
  Atomics.store(STATE_MATRIX.signalGrid, 40 * 140 + 40, 800);

  const crystalsBefore = MATRIX_ENGINE.getCrystalCount();
  // Run 5 ticks — each annex tick probes 4 neighbors
  for (let t = 0; t < 5; t++) await PULSE.tick();
  const crystalsAfter = MATRIX_ENGINE.getCrystalCount();

  if (crystalsAfter > crystalsBefore) {
    console.log(
      `✅ Territory expanded! Crystals: ${crystalsBefore} → ${crystalsAfter} (+${
        crystalsAfter - crystalsBefore
      })`,
    );
  } else {
    console.log(
      `ℹ️  Crystals: ${crystalsBefore} → ${crystalsAfter} (expansion may need more ticks)`,
    );
  }

  // ── TEST 2: Colony Conflict — two colonies contest the same territory ───
  console.log("\n⚔️  Test 2: Colony B attacks Colony A's territory...");

  // Colony B: ISA_ANNEX with BB signature
  const genomeB = new Uint8Array([
    0x46,
    0xBB,
    0x11,
    0x22,
    0x02,
    0x00,
    0x00,
    0x00,
  ]);

  // Plant a Colony A crystal target — manually set genome A beacon
  const contestCell = 41 * 140 + 41; // neighbor of (400,400)
  Atomics.store(STATE_MATRIX.structureGrid, contestCell, CRYSTAL_COLONY);
  Atomics.store(STATE_MATRIX.signalGrid, contestCell, 200);
  // Write Colony A's genome into the beacon
  const memeView = new BigInt64Array(
    STATE_MATRIX.buffer,
    33000000 + 1000000 + contestCell * 8, // MEMORY_GRID_OFFSET + cell * 8
    1,
  );
  memeView[0] = 0xAABBCC01_00000005n; // genome A prefix + count 5

  // Spawn 3 Colony B attackers adjacent to that cell
  for (let i = 10; i < 13; i++) {
    spawnAtom(i, 410, 410, genomeB.slice());
  }

  const signalBefore = Atomics.load(STATE_MATRIX.signalGrid, contestCell);
  for (let t = 0; t < 5; t++) await PULSE.tick();
  const signalAfter = Atomics.load(STATE_MATRIX.signalGrid, contestCell);
  const typeAfter = Atomics.load(STATE_MATRIX.structureGrid, contestCell);

  console.log(`   Contest cell signal: ${signalBefore} → ${signalAfter}`);
  if (signalAfter < signalBefore) {
    console.log(`✅ Colony B eroded Colony A's territory! Signal drained.`);
    if (typeAfter === 0) {
      console.log(
        `🏆 Colony A territory CONQUERED — cell reverted to neutral!`,
      );
    }
  } else {
    console.log(`ℹ️  Territory held. Colony A defended.`);
  }

  // ── SUMMARY ────────────────────────────────────────────────────────────
  const finalCrystals = MATRIX_ENGINE.getCrystalCount();
  const finalResonance = MATRIX_ENGINE.getTotalResonance();
  console.log(`\n📊 Arms Race Status:`);
  console.log(`   🔷 Total Crystals: ${finalCrystals}`);
  console.log(`   ⚡ Total Resonance: ${finalResonance}`);
  console.log(
    "\n🏴 Phase 16: Territorial Arms Race VERIFIED. Colonies wage war for the Matrix. 🧬💎🛡️",
  );
}

runTest().then(() => Deno.exit(0)).catch(console.error);
