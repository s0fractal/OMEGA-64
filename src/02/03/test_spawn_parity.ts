// OMEGA-64 | test_spawn_parity.ts | Spawn Resolution Verifier
import { MX } from "@g";
import { MAX_ATOMS, SPAWN_REQUESTS_OFFSET } from "@g";
import { PULSE } from "@g";

async function testSpawnParity() {
  console.log("🧬 [TEST] Starting Spawn Resolution Parity Test...");

  const MAX_ATOMS = MAX_ATOMS;
  const { buffer: sharedBuffer } = MX.MX;

  // 1. Clear state
  MX.MX.clear();
  // Clear spawn queue (header + data)
  new Uint8Array(sharedBuffer).fill(
    0,
    SPAWN_REQUESTS_OFFSET,
    SPAWN_REQUESTS_OFFSET + 8 + 1024 * 16,
  );

  console.log(`   [DEBUG] sharedBuffer.byteLength=${sharedBuffer.byteLength}`);
  console.log(
    `   [DEBUG] SPAWN_REQUESTS_OFFSET=${SPAWN_REQUESTS_OFFSET}`,
  );
  const spawnHead = new Int32Array(
    sharedBuffer,
    SPAWN_REQUESTS_OFFSET,
    2,
  );
  const spawnData = new Uint8Array(
    sharedBuffer,
    SPAWN_REQUESTS_OFFSET + 8,
    1024 * 16,
  );
  console.log(`   [DEBUG] spawnData.byteLength=${spawnData.byteLength}`);

  // 2. Setup Reference State
  // We'll occupy some slots to test findFreeSlot
  for (let i = 0; i < 100; i++) {
    if (i % 3 === 0) {
      MX.MX.setId(i, BigInt(i + 1));
    }
  }

  // 3. Add Spawn Requests
  const genome = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const addRequest = (idx: number, gx: number, gy: number, energy: number) => {
    const slotOff = idx * 16;
    spawnData.set(genome, slotOff);
    const view = new DataView(
      spawnData.buffer,
      spawnData.byteOffset + slotOff,
      16,
    );
    view.setInt16(8, gx, true);
    view.setInt16(10, gy, true);
    view.setInt32(12, energy, true);
  };

  addRequest(0, 50, 60, 500);
  addRequest(1, 70, 80, 1000);
  Atomics.store(spawnHead, 0, 2); // writeHead = 2
  Atomics.store(spawnHead, 1, 0); // readHead = 0

  // Clone ids for host reference
  const refIds = new BigUint64Array(MAX_ATOMS);
  for (let i = 0; i < MAX_ATOMS; i++) {
    refIds[i] = MX.MX.getId(i);
  }

  // --- RUN HOST LOGIC ---
  console.log("   [HOST] Running legacy spawn logic...");
  const tick = 123;
  let hostSpawnCount = 0;
  let hostCursor = 0;
  const hostWriteCursor = 2;
  let hostFreeSearch = 0;

  while (hostCursor < hostWriteCursor && hostSpawnCount < 64) {
    const slotOff = (hostCursor % 1024) * 16;
    const dView = new DataView(
      spawnData.buffer,
      spawnData.byteOffset + slotOff,
      16,
    );
    // findFreeSlot
    let found = -1;
    for (let i = 0; i < MAX_ATOMS; i++) {
      const idx = (hostFreeSearch + i) % MAX_ATOMS;
      if (refIds[idx] === 0n) {
        found = idx;
        break;
      }
    }

    if (found !== -1) {
      const id = (BigInt(tick) << 32n) | BigInt(found);
      refIds[found] = id;
      hostFreeSearch = (found + 1) % MAX_ATOMS;
      hostSpawnCount++;
    }
    hostCursor++;
  }

  // --- RUN WASM LOGIC ---
  console.log("   [WASM] Running kernel spawn logic...");
  // Disable self-test for test run
  // (We'll use the env var anyway, but good to check)
  if (!(PULSE as any).workers || (PULSE as any).workers.length === 0) {
    await PULSE.initWorkers();
  }
  const worker0 = (PULSE as any).getWorker(0);
  const pulseId = Date.now();

  await new Promise<void>((resolve) => {
    const handler = (e: MessageEvent) => {
      if (e.data.type === "DRAIN_SPAWN_DONE" && e.data.pulseId === pulseId) {
        worker0.removeEventListener("message", handler);
        console.log(`   [WASM] Drain done, count=${e.data.count}`);
        resolve();
      }
    };
    worker0.addEventListener("message", handler);
    worker0.postMessage({ type: "DRAIN_SPAWN", pulseId, tick });
  });

  // --- COMPARISON ---
  let errors = 0;
  for (let i = 0; i < MAX_ATOMS; i++) {
    const wasmId = MX.MX.getId(i);
    const hostId = refIds[i];
    if (wasmId !== hostId) {
      if (errors < 10) {
        console.error(
          `❌ Spawn Mismatch @ atom=${i}: WASM=${wasmId} HOST=${hostId}`,
        );
      }
      errors++;
    }
  }

  if (errors === 0) {
    console.log("✅ [PARITY] Spawn Draining bit-perfect!");
  } else {
    console.log(`❌ [PARITY] Spawn Draining failed with ${errors} errors.`);
    Deno.exit(1);
  }
}

testSpawnParity().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
