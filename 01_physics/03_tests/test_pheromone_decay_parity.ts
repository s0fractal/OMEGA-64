// OMEGA-64 | test_pheromone_decay_parity.ts | Era 72: Absolute Coherence
import { STATE_MATRIX, wasmMemory } from "../../00_substrate/mod.ts";
import { PHYSICS_ENGINE } from "../mod.ts";
import { LOGGER } from "../../00_substrate/mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

async function runTest() {
  LOGGER.info("🧪 [TEST] Pheromone Decay Parity (Host vs WASM)");

  // 1. Load WASM Kernel manually for synchronous testing
  const wasmBytes = await Deno.readFile("08_artifacts/release.wasm");
  const instantiated = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom: () => {} },
    env: {
      memory: wasmMemory,
      abort: (msg: any) => console.error("WASM ABORT:", msg),
      trace_atom: () => {},
    },
  });

  const tick_environment = instantiated.instance.exports.tick_environment as (
    tick: number,
  ) => void;

  // 2. Setup initial state in Attention Field (Float32)
  const cellIdx = 1234;
  const initialValue = 100.0;

  STATE_MATRIX.clear();
  STATE_MATRIX.attentionField[cellIdx] = initialValue;

  LOGGER.info(
    `   [PHASE 1] Attention Field before Host Decay: ${
      STATE_MATRIX.attentionField[cellIdx]
    }`,
  );

  // 3. Perform Host Decay (Legacy)
  const expectedValue = initialValue * 0.90;
  PHYSICS_ENGINE.decayPheromones();

  const hostResult = STATE_MATRIX.attentionField[cellIdx];
  LOGGER.info(
    `   [PHASE 2] Host Decay Result: ${hostResult} (Expected: ${expectedValue})`,
  );

  // Verify host logic itself works as expected in this test
  assertEquals(hostResult, expectedValue, "Host decay logic mismatch");

  // 4. Reset and Perform WASM Decay
  STATE_MATRIX.attentionField[cellIdx] = initialValue;
  LOGGER.info(
    `   [PHASE 3] Resetting to ${initialValue} for WASM verification.`,
  );

  // Trigger TICK_ENVIRONMENT directly
  tick_environment(1);

  const wasmResult = STATE_MATRIX.attentionField[cellIdx];
  LOGGER.info(`   [PHASE 4] WASM Decay Result: ${wasmResult}`);

  // 5. Assert Parity
  // We use a small epsilon for float comparison
  const diff = Math.abs(wasmResult - expectedValue);
  if (diff < 0.0001) {
    LOGGER.info(
      "✅ [SUCCESS] Pheromone Decay Parity Confirmed (Float Precision).",
    );
  } else {
    LOGGER.error(
      `❌ [FAILURE] Parity Mismatch! WASM=${wasmResult} Expected=${expectedValue} Diff=${diff}`,
    );
    throw new Error("Parity Mismatch");
  }

  // 6. Test Zeroing logic
  // Our WASM logic has a threshold: if (val < 0.001) val = 0;
  STATE_MATRIX.attentionField[cellIdx] = 0.0005;
  tick_environment(2);

  const zeroedResult = STATE_MATRIX.attentionField[cellIdx];
  LOGGER.info(
    `   [PHASE 5] Zeroing Test: Input=0.0005 WASM Result=${zeroedResult}`,
  );
  assertEquals(
    zeroedResult,
    0,
    "WASM failed to zero out negligible pheromones",
  );

  LOGGER.info("✅ [TEST COMPLETE] All parity checks passed.");
}

if (import.meta.main) {
  runTest().catch((v) => {
    LOGGER.error(v);
    Deno.exit(1);
  });
}
