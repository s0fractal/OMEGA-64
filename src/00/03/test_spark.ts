// test_spark.ts
// Verification of Era 2.6: The Spark (Autonomous Loop)

import { LOOP_LOOP as LOOP } from "@g";
import { LEDGER__08_00_LEDGER as LEDGER } from "@g";

console.log("🔥 TEST SPARK: Initializing...");

// Mock Ledger Storage to avoid cluttering real ledger
LEDGER.STORAGE_PATH = "./TEST_SPARK_LEDGER.jsonl";
import { PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX as PROPOSAL_ENVELOPE_INDEX } from "@g";
PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH = "./TEST_SPARK_ENVELOPE_INDEX.jsonl";

// Run the Loop for 20 ticks
await LOOP.ignite({
  maxTicks: 20,
  port: 8083,
  config: {
    dry_run: false,
  },
});

// Wait for loop to finish (simulating wait as ignite is mostly async but interval based)
// But ignite returns promise? No, ignite is async but the interval is async.
// We need to wrap it or wait.
// Modified LOOP.ignite to return a Promise that resolves when maxTicks reached?
// No, implementation used setInterval.
// We will manually wait here.

console.log("⏳ TEST SPARK: Waiting for 20 ticks...");
await new Promise((r) => setTimeout(r, 3000));

console.log("✅ TEST SPARK: Finished.");
