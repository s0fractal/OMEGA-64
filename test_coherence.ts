// OMEGA-64 | test_coherence.ts | Phase 21: Synchronization Barrier 🛡️💎
import { STATE_MATRIX, SYNC } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";

async function runTest() {
  console.log("🛡️ Phase 21: Synchronization Barrier Verification\n");
  console.log("Testing for Torn Reads/Writes under high-concurrency stress...");

  await PULSE.initWorkers();

  // 1. Seed a set of atoms with distinct "Magic" genomes
  // We use 64-bit values that are easy to verify if torn.
  // Pattern: [0xAAAA_AAAA, 0xBBBB_BBBB] or [0x1111_1111, 0x2222_2222]
  const MAGIC_PATTERNS = [
    new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]),
    new Uint8Array([0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB]),
    new Uint8Array([0x11, 0x11, 0x11, 0x11, 0x22, 0x22, 0x22, 0x22]),
    new Uint8Array([0xDD, 0xDD, 0xDD, 0xDD, 0xEE, 0xEE, 0xEE, 0xEE]),
  ];

  const ATOM_COUNT = 100;
  for (let i = 0; i < ATOM_COUNT; i++) {
    STATE_MATRIX.setId(i, BigInt(i + 1));
    STATE_MATRIX.setX(i, Math.random() * 1400);
    STATE_MATRIX.setY(i, Math.random() * 800);
    STATE_MATRIX.setEnergy(i, 2000);
    STATE_MATRIX.setLogic(i, MAGIC_PATTERNS[i % MAGIC_PATTERNS.length]);
  }

  let tornCount = 0;
  let totalReads = 0;
  let stopTest = false;

  // 2. Background Read Thread (Simulating Host/UI/Snapshot)
  // This thread will attempt to read genomes as fast as possible.
  const reader = (async () => {
    const syncState = STATE_MATRIX.syncState;
    while (!stopTest) {
      // ONLY read when SYNC_STATE is HOST_LOCK (2) or IDLE (0)
      // If the barrier works, we should NEVER see a torn genome.
      const s = Atomics.load(syncState, 0);
      if (s === SYNC.IDLE || s === SYNC.HOST_LOCK) {
        for (let i = 0; i < ATOM_COUNT; i++) {
          const logic = STATE_MATRIX.getLogic(i);
          totalReads++;

          // Verify if the 8 bytes belong to one of our MAGIC_PATTERNS
          const matches = MAGIC_PATTERNS.some((p) => {
            for (let b = 0; b < 8; b++) {
              if (p[b] !== logic[b]) return false;
            }
            return true;
          });

          if (!matches) {
            tornCount++;
            console.error(`❌ TORN READ DETECTED AT ATOM ${i}!`);
            console.error(
              `   Value: ${
                Array.from(logic).map((b) => b.toString(16).padStart(2, "0"))
                  .join(" ")
              }`,
            );
          }
        }
      }
      // Add a tiny delay to not completely saturate the thread
      // await new Promise(r => setTimeout(r, 0));
    }
  })();

  // 3. Main Pulse Loop
  // This will drive transitions: 0 -> 1 (TICK) -> 2 (LOCK) -> 0
  console.log("⏱️  Running 100 high-speed pulses...");
  for (let t = 0; t < 100; t++) {
    await PULSE.tick();
    if (t % 10 === 0) Deno.stdout.write(new TextEncoder().encode("."));
  }
  console.log("\n");

  stopTest = true;
  await reader;

  console.log(`📊 Coherence Summary:`);
  console.log(`   Total Genome Reads: ${totalReads}`);
  console.log(`   Torn Reads Detected: ${tornCount}`);

  if (tornCount === 0) {
    console.log(
      `\n✅ SUCCESS: Coherence maintained! Sync barrier eliminated torn reads. 🛡️💎`,
    );
  } else {
    console.log(
      `\n❌ FAILURE: ${tornCount} torn reads detected. Synchronization leak!`,
    );
  }

  Deno.exit(tornCount === 0 ? 0 : 1);
}

runTest();
