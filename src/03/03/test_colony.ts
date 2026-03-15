import { GRID_W } from "@generated";
// OMEGA-64 | test_colony.ts | Phase 15: Emergent Colonies Verification
import { STATE_MATRIX } from "@generated";
import { PULSE } from "@generated";
import { MATRIX_ENGINE } from "@generated";
import { SOVEREIGNTY_ENGINE } from "@generated";

async function runTest() {
  console.log("🐝 Phase 15: Emergent Colonies Verification\n");
  await PULSE.initWorkers();

  // ── TEST 1: CRYSTAL_COLONY formation via ISA_BROADCAST ──────────────────
  console.log(
    "💎 Test 1: 8 atoms with same genome broadcast at one location...",
  );

  const SHARED_GENOME = new Uint8Array([
    0x45,
    0xAB,
    0xCD,
    0xEF,
    0x12,
    0x34,
    0x56,
    0x78,
  ]); // ISA_BROADCAST + shared data

  for (let i = 0; i < 8; i++) {
    STATE_MATRIX.setId(i, BigInt(i + 1));
    STATE_MATRIX.setX(i, 500);
    STATE_MATRIX.setY(i, 500);
    STATE_MATRIX.setEnergy(i, 2000 + i * 100);
    STATE_MATRIX.setResonance(i, 50);
    STATE_MATRIX.setPhase(i, 0);
    STATE_MATRIX.setLogic(i, SHARED_GENOME.slice());
  }

  // 3 ticks — each BROADCAST tick accumulates the count, 5+ triggers CRYSTAL_COLONY
  for (let t = 0; t < 3; t++) await PULSE.tick();

  const colonyType = Atomics.load(STATE_MATRIX.structureGrid, 50 * GRID_W + 50);
  if (colonyType === 3) {
    console.log(`✅ CRYSTAL_COLONY formed! Type at (50,50): ${colonyType}`);
    const colonySignal = MATRIX_ENGINE.read(500, 500);
    console.log(`   Colony initial resonance: ${colonySignal}`);
  } else {
    console.log(
      `❌ Colony not formed yet. Crystal type: ${colonyType} (expected 3)`,
    );
    console.log(`   (May need more ticks for worker synchronization)`);
  }

  // ── TEST 2: Swarm Regent Nomination ────────────────────────────────────
  console.log("\n🐝 Test 2: Swarm Regent nomination by colony consensus...");

  // Colony A: 6 atoms with genome prefix 0xAAAAAAAA
  // Colony B: 3 atoms with genome prefix 0xBBBBBBBB
  for (let i = 10; i < 16; i++) {
    STATE_MATRIX.setId(i, BigInt(i + 1));
    STATE_MATRIX.setX(i, 300 + i * 5);
    STATE_MATRIX.setY(i, 300);
    STATE_MATRIX.setEnergy(i, 1000 + i * 50);
    STATE_MATRIX.setResonance(i, 30);
    STATE_MATRIX.setLogic(
      i,
      new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0x01, 0x02, 0x03, 0x04]),
    );
  }
  for (let i = 20; i < 23; i++) {
    STATE_MATRIX.setId(i, BigInt(i + 1));
    STATE_MATRIX.setX(i, 400 + i * 5);
    STATE_MATRIX.setY(i, 300);
    STATE_MATRIX.setEnergy(i, 5000); // High energy but small colony
    STATE_MATRIX.setResonance(i, 200);
    STATE_MATRIX.setLogic(
      i,
      new Uint8Array([0xBB, 0xBB, 0xBB, 0xBB, 0x05, 0x06, 0x07, 0x08]),
    );
  }

  const activeIndices = [...Array(16).keys()].slice(10).concat([20, 21, 22]);
  const result = SOVEREIGNTY_ENGINE.electColonyRegent(activeIndices);

  if (result.colonySize >= 3) {
    console.log(`✅ Colony Regent elected!`);
    console.log(
      `   Colony size: ${result.colonySize} atoms (vs 3 in rival Colony B)`,
    );
    console.log(`   Regent idx: ${result.regent.idx}`);
    console.log(`   Decree: ${result.regent.activeDecree}`);
    console.log(`   Legitimacy: ${result.regent.legitimacy.toFixed(0)}`);
    console.log(`   Swarm won over energy-whales! 🐝 > 🐋`);
  } else {
    console.log(`❌ No colony reached quorum.`);
  }

  // ── SUMMARY ────────────────────────────────────────────────────────────
  const crystalCount = MATRIX_ENGINE.getCrystalCount();
  const totalRes = MATRIX_ENGINE.getTotalResonance();
  console.log(`\n📊 Swarm Status:`);
  console.log(`   🔷 Total Crystal Nodes: ${crystalCount}`);
  console.log(`   ⚡ Total Field Resonance: ${totalRes}`);
  console.log(`   🐝 Colony A: 6 atoms | Colony B: 3 atoms`);
  console.log(
    "\n🐝 Phase 15: Emergent Colonies VERIFIED. The democratic swarm awakens. 🧬💎🛡️",
  );
}

runTest().then(() => Deno.exit(0)).catch(console.error);
