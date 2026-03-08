// test_swarm.ts
// Verification of Era 4.0: The Federated Mind
// Launches two nodes and verifies they discover each other.

import { PEER_PEER as PEER } from "@omega";

console.log("🌐 TEST SWARM: Initializing Clusters...");

// Cleanup previous swarm state and ledgers
try {
  await Deno.remove("./OMEGA_SWARM.json");
} catch (e) {
  // Ignore missing swarm file
}

try {
  for await (const entry of Deno.readDir(".")) {
    if (entry.isFile && entry.name.endsWith(".jsonl")) {
      await Deno.remove(entry.name);
    }
  }
} catch (e) {
  // Ignore cleanup errors
}

// Launch Alpha (Port 8081)
console.log("🚀 Launching Alpha Node (8081)...");
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

// Launch Beta (Port 8082)
console.log("🚀 Launching Beta Node (8082)...");
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

// Wait for 15 seconds (giving them time to boot and pulse)
console.log("⏳ Waiting for discovery (15s)...");
await new Promise((r) => setTimeout(r, 15000));

// Check Swarm File
console.log("🔍 Inspecting OMEGA_SWARM.json...");
try {
  const text = await Deno.readTextFile("./OMEGA_SWARM.json");
  const swarm = JSON.parse(text);
  console.log("📄 Swarm State:", JSON.stringify(swarm, null, 2));

  if (swarm.length >= 2) {
    console.log("✅ SUCCESS: Swarm detected multiple peers.");

    // Verify Ports
    const ports = swarm.map((p: any) => p.address);
    if (
      ports.some((p: string) => p.includes("8081")) &&
      ports.some((p: string) => p.includes("8082"))
    ) {
      console.log("✅ SUCCESS: Alpha and Beta present.");
    } else {
      console.warn("⚠️ Warning: Ports mismatch.");
    }
  } else {
    console.error("❌ FAILURE: Swarm not formed (Count < 2).");
  }
} catch (e) {
  console.error("❌ FAILURE: Could not read swarm file.", e);
}

// Cleanup
console.log("🛑 Killing nodes...");
try {
  alpha.kill();
  beta.kill();
} catch (e) {
  // Ignore teardown errors
}
console.log("✅ TEST SWARM: Finished.");
