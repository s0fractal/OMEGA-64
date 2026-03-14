// OMEGA-64 | test_bond_resolution_parity.ts | Bond Resolution Verifier
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import {
  BONDS_OFFSET,
  BOND_REQUESTS_OFFSET,
  MAX_ATOMS,
  STIFFNESS_OFFSET
} from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { PULSE } from "@02";

async function testBondParity() {
  console.log("🧬 [TEST] Starting Bond Resolution Parity Test...");

  // 1. Setup Bond Requests
  const MAX_ATOMS = MAX_ATOMS;

  // Clear buffers
  new Uint8Array(STATE_MATRIX.sharedBuffer).fill(
    0,
    BONDS_OFFSET,
    BONDS_OFFSET + MAX_ATOMS * 4 * 4,
  );
  new Uint8Array(STATE_MATRIX.sharedBuffer).fill(
    0,
    STIFFNESS_OFFSET,
    STIFFNESS_OFFSET + MAX_ATOMS * 4 * 4,
  );
  new Uint8Array(STATE_MATRIX.sharedBuffer).fill(
    0,
    BOND_REQUESTS_OFFSET,
    BOND_REQUESTS_OFFSET + MAX_ATOMS * 3 * 4,
  );

  console.log(
    `   [OFFSETS] BONDS_OFFSET=${BONDS_OFFSET} BOND_REQUESTS_OFFSET=${BOND_REQUESTS_OFFSET} MAX_ATOMS=${MAX_ATOMS}`,
  );
  const bondRequests = new Int32Array(
    STATE_MATRIX.sharedBuffer,
    BOND_REQUESTS_OFFSET,
    MAX_ATOMS * 3,
  );
  const bonds = new Uint32Array(
    STATE_MATRIX.sharedBuffer,
    BONDS_OFFSET,
    MAX_ATOMS * 4,
  );
  const stiffness = new Float32Array(
    STATE_MATRIX.sharedBuffer,
    STIFFNESS_OFFSET,
    MAX_ATOMS * 4,
  );

  // Scenario 1: Simple bond request
  // Atom 10 requests bond with Atom 20
  Atomics.store(bondRequests, 10 * 3, 10 + 1); // initiator
  Atomics.store(bondRequests, 10 * 3 + 1, 20 + 1); // target
  Atomics.store(bondRequests, 10 * 3 + 2, 1); // status: active

  // Scenario 2: Out of bounds target (should be cleared but not applied)
  Atomics.store(bondRequests, 30 * 3, 30 + 1);
  Atomics.store(bondRequests, 30 * 3 + 1, MAX_ATOMS + 5);
  Atomics.store(bondRequests, 30 * 3 + 2, 1);

  // Scenario 3: inactive request
  Atomics.store(bondRequests, 40 * 3, 40 + 1);
  Atomics.store(bondRequests, 40 * 3 + 1, 41 + 1);
  Atomics.store(bondRequests, 40 * 3 + 2, 0);

  // Clone buffers for reference
  const refBonds = new Uint32Array(MAX_ATOMS * 4);
  const refStiffness = new Float32Array(MAX_ATOMS * 4);

  // --- RUN HOST LOGIC ---
  console.log("   [HOST] Running legacy resolution logic...");
  for (let i = 0; i < MAX_ATOMS; i++) {
    const initiatorPlus1 = bondRequests[i * 3];
    const status = bondRequests[i * 3 + 2];
    if (initiatorPlus1 !== 0 && status === 1) {
      const targetPlus1 = bondRequests[i * 3 + 1];
      const initiator = initiatorPlus1 - 1;
      const target = targetPlus1 - 1;
      if (target >= 0 && target < MAX_ATOMS) {
        refBonds[initiator * 4 + 0] = target;
        refStiffness[initiator * 4 + 0] = 0.1;
        refBonds[target * 4 + 1] = initiator;
        refStiffness[target * 4 + 1] = 0.1;
      }
    }
  }

  // --- RUN WASM LOGIC ---
  console.log(
    "   [DEBUG] Request @10:",
    bondRequests[10 * 3],
    bondRequests[10 * 3 + 1],
    bondRequests[10 * 3 + 2],
  );

  console.log("   [WASM] Running kernel resolution logic...");
  // We need to wait for workers to be ready
  if (!(PULSE as any).workers || (PULSE as any).workers.length === 0) {
    await PULSE.initWorkers();
  }
  const worker0 = (PULSE as any).getWorker(0);

  const pulseId = Date.now();
  await new Promise<void>((resolve) => {
    const handler = (e: MessageEvent) => {
      if (e.data.type === "RESOLVE_BONDS_DONE" && e.data.pulseId === pulseId) {
        worker0.removeEventListener("message", handler);
        console.log(
          `   [WASM] Resolution done, pulseId=${e.data.pulseId}, count=${e.data.count}`,
        );
        resolve();
      }
    };
    worker0.addEventListener("message", handler);
    worker0.postMessage({
      type: "RESOLVE_BONDS",
      pulseId,
      startIdx: 0,
      endIdx: MAX_ATOMS,
    });
  });

  console.log(
    "   [DEBUG] Request @10 AFTER:",
    bondRequests[10 * 3],
    bondRequests[10 * 3 + 1],
    bondRequests[10 * 3 + 2],
  );
  console.log("   [DEBUG] Bond @10 AFTER:", bonds[10 * 4], stiffness[10 * 4]);

  // --- COMPARISON ---
  let errors = 0;
  for (let i = 0; i < MAX_ATOMS; i++) {
    for (let s = 0; s < 4; s++) {
      const idx = i * 4 + s;
      const wasmB = Atomics.load(bonds, idx);
      const hostB = refBonds[idx];
      if (wasmB !== hostB) {
        console.error(
          `❌ Bond Mismatch @ atom=${i} slot=${s}: WASM=${wasmB} HOST=${hostB}`,
        );
        errors++;
      }

      const wasmS = stiffness[idx];
      const hostS = refStiffness[idx];
      if (Math.abs(wasmS - hostS) > 0.0001) {
        console.error(
          `❌ Stiffness Mismatch @ atom=${i} slot=${s}: WASM=${wasmS} HOST=${hostS}`,
        );
        errors++;
      }
    }
    // Check if requests were cleared
    if (bondRequests[i * 3] !== 0 || bondRequests[i * 3 + 2] !== 0) {
      console.error(`❌ Bond Request NOT cleared @ atom=${i}`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log("✅ [PARITY] Bond Resolution bit-perfect!");
  } else {
    console.log(`❌ [PARITY] Bond Resolution failed with ${errors} errors.`);
    Deno.exit(1);
  }
}

testBondParity().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
