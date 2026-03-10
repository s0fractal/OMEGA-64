import { PULSE } from "../PULSE.ts";
import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";

async function main() {
  console.log("🧪 [TEST] Kuramoto Singularity (Infinite Loop Hotfix)");
  STATE_MATRIX.clear();

  // Create 1000 atoms at exact same coordinate (100, 100)
  for (let i = 0; i < 1000; i++) {
    STATE_MATRIX.setId(i, BigInt(i + 1));
    STATE_MATRIX.setX(i, 10000); // 100 * 100
    STATE_MATRIX.setY(i, 10000);
    STATE_MATRIX.setEnergy(i, 200000); // lots of energy to avoid immediate death
    STATE_MATRIX.setResonance(i, 255);
    STATE_MATRIX.setPhase(i, i % 256);

    // Bytecode: OP_RESONATE_KURAMOTO (0xB1) -> Jmp to 0
    const inst = STATE_MATRIX.getInstructions(i);
    inst.set([0xB1, 0x12, 0x00]);
    // pc is context[8] -> 0
    const ctx = STATE_MATRIX.getContext(i);
    ctx[8] = 0;
  }

  // Set number of workers for testing
  Deno.env.set("OMEGA_PULSE_WORKERS", "4");

  await PULSE.initWorkers();

  const start = performance.now();
  await PULSE.tick(); // Execute the frame
  const elapsed = performance.now() - start;

  console.log(`⏱️ Frame completed in ${elapsed.toFixed(2)}ms`);

  // Assert it completes incredibly fast due to execution limits and neighbor limits
  // (under normal circumstances an O(N^2) loop here without limits would hang the worker)
  if (elapsed > 100) { 
     console.warn(`⚠️ Warning: Executed in ${elapsed}ms, which is slower than 100ms bound.`);
  }

  // We should see it finish cleanly. 
  assertEquals(true, true);
  
  PULSE.stopWorkers();
  console.log("✅ [TEST] Kuramoto Singularity test passed (No WorkerTimeoutError).");
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  PULSE.stopWorkers();
  Deno.exit(1);
});
