// test_checkpoint.ts
// Checkpoint persistence and lookup behavior.

import { CHECKPOINT_CHECKPOINT as CHECKPOINT } from "@g";

export async function runTest() {
  console.log("🧪 TESTING: Checkpoint Save/Load");
  const originalPath = CHECKPOINT.STORAGE_PATH;
  const tempPath = await Deno.makeTempFile({
    prefix: "omega-checkpoint-",
    suffix: ".jsonl",
  });
  CHECKPOINT.STORAGE_PATH = tempPath;
  await Deno.writeTextFile(CHECKPOINT.STORAGE_PATH, "");

  try {
    await CHECKPOINT.save(
      { tick: 10, state_hash: "h10", state_i16: new Int16Array(64).fill(10) },
      "TEST_A",
    );
    await CHECKPOINT.save(
      { tick: 20, state_hash: "h20", state_i16: new Int16Array(64).fill(20) },
      "TEST_B",
    );

    const exact10 = await CHECKPOINT.loadExact(10);
    if (!exact10 || exact10.state_hash !== "h10") {
      throw new Error("loadExact(10) failed");
    }

    const near15 = await CHECKPOINT.loadNearestAtOrBefore(15);
    if (!near15 || near15.tick !== 10) {
      throw new Error("loadNearestAtOrBefore(15) failed");
    }

    const near100 = await CHECKPOINT.loadNearestAtOrBefore(100);
    if (!near100 || near100.tick !== 20) {
      throw new Error("loadNearestAtOrBefore(100) failed");
    }
  } finally {
    try {
      await Deno.remove(CHECKPOINT.STORAGE_PATH);
    } catch {
      // ignore cleanup errors
    }
    CHECKPOINT.STORAGE_PATH = originalPath;
  }
}

Deno.test("checkpoint save/load/nearest", async () => {
  await runTest();
});

if (import.meta.main) {
  await runTest();
}
