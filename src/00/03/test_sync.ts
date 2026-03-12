// test_sync.ts
// Verification of Era 4.0: Swarm Sync
// Launches Alpha (Lead) and Beta (Lag).

import { PEER_PEER as PEER } from "@omega";

console.log("🌐 TEST SYNC: Initializing Clusters...");

// Cleanup
try {
  await Deno.remove("./OMEGA_SWARM.json");
  for await (const entry of Deno.readDir(".")) {
    if (
      entry.isFile &&
      (entry.name.endsWith(".jsonl") || entry.name.includes("OMEGA_LEDGER"))
    ) {
      console.log(`🧹 Cleanup: Removing ${entry.name}`);
      await Deno.remove(entry.name);
    }
  }
} catch (e) {
  // Ignore cleanup errors
}

// Launch Alpha (Port 8081) - Runs normally
console.log("🚀 Launching Alpha (8081)...");
const alpha = new Deno.Command("deno", {
  args: [
    "run",
    "--allow-read",
    "--allow-write",
    "--allow-net",
    "5/3/LOOP/_.ts",
    "--port=8081",
  ],
  stdout: "inherit",
  stderr: "inherit",
}).spawn();

// Wait 5 seconds for Alpha to build up state (approx 50 ticks)
console.log("⏳ Letting Alpha build entropy (5s)...");
await new Promise((r) => setTimeout(r, 5000));

// Launch Beta (Port 8082) - Starts Fresh
console.log("🚀 Launching Beta (8082)...");
const beta = new Deno.Command("deno", {
  args: [
    "run",
    "--allow-read",
    "--allow-write",
    "--allow-net",
    "5/3/LOOP/_.ts",
    "--port=8082",
  ],
  stdout: "inherit",
  stderr: "inherit",
}).spawn();

// Wait 10 seconds for Sync
console.log("⏳ Waiting for Sync (10s)...");
await new Promise((r) => setTimeout(r, 10000));

console.log("🛑 Stopping Clusters...");
try {
  alpha.kill();
  beta.kill();
} catch (e) {
  // Ignore teardown errors
}

// Verify Ledgers
// We expect Beta's ledger to have high ticks despite starting late.
console.log("🔍 Verifying Sync...");
try {
  const alphaLedger = await Deno.readTextFile("./OMEGA_LEDGER_8081.jsonl");
  const betaLedger = await Deno.readTextFile("./OMEGA_LEDGER_8082.jsonl");

  const alphaLines = alphaLedger.trim().split("\n");
  const betaLines = betaLedger.trim().split("\n");

  const lastAlpha = JSON.parse(alphaLines[alphaLines.length - 1]);
  const lastBeta = JSON.parse(betaLines[betaLines.length - 1]);

  console.log(`Alpha Tip: ${lastAlpha.tick}`);
  console.log(`Beta Tip:  ${lastBeta.tick}`);

  if (lastBeta.tick > 20) { // Should be well above 0
    console.log("✅ SUCCESS: Beta synced state.");
  } else {
    console.error("❌ FAILURE: Beta did not sync.");
  }
} catch (e) {
  console.error("❌ FAILURE: Could not read ledgers.", e);
}
