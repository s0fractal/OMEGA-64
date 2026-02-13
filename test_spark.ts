// test_spark.ts
// Verification of Era 2.6: The Spark (Autonomous Loop)

import { LOOP } from "./i.L43.core.LOOP.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";

console.log("🔥 TEST SPARK: Initializing...");

// Mock Ledger Storage to avoid cluttering real ledger
LEDGER.STORAGE_PATH = "./TEST_SPARK_LEDGER.jsonl";

// Run the Loop for 20 ticks
await LOOP.ignite({
    maxTicks: 20,
    config: {
        dry_run: false
    }
});

// Wait for loop to finish (simulating wait as ignite is mostly async but interval based)
// But ignite returns promise? No, ignite is async but the interval is async.
// We need to wrap it or wait. 
// Modified LOOP.ignite to return a Promise that resolves when maxTicks reached? 
// No, implementation used setInterval.
// We will manually wait here.

console.log("⏳ TEST SPARK: Waiting for 20 ticks...");
await new Promise(r => setTimeout(r, 3000));

console.log("✅ TEST SPARK: Finished.");
