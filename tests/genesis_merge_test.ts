import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { delay } from "https://deno.land/std@0.210.0/async/delay.ts";
import { seedSeededSwarmScenario } from "../worker_seeded_swarm.ts";

if (Deno.args[0] === "run-node") {
  const role = Deno.args[1];
  const port = parseInt(Deno.args[2], 10);
  const peerPort = parseInt(Deno.args[3] || "0", 10);

  const { PULSE, NEXUS_DAEMON } = await import("../PULSE.ts");
  const { STATE_MATRIX } = await import("../STATE_MATRIX.ts");

  // Do not lock port up front; SwarmNexus assigns port 0 to fallback to ephemeral
  if (port >= 0) {
      NEXUS_DAEMON.port = port;
  }

  if (role === "genesis") {
    seedSeededSwarmScenario(STATE_MATRIX, {
        seed: 42,
        replicators: 20,
        architects: 2
    });
    await PULSE.initWorkers();
    
    // Crucial: Wait for Deno.serve asynchronous back-end threads to natively bind to the TCP OS loop 
    // before we bombard WASM with blocking Shadow Rehearsals that starve the event loop.
    await delay(500);

    for (let i = 0; i < 100; i++) {
       await PULSE.tick();
       await delay(5); // Explicit yield to Deno event loop for TCP!
    }
    const hash100 = await PULSE.generateEpochProof(100);
    console.log(`HASH_100:${hash100}`);

    // Wait for peer to initialize, connect, request sync, and merge the payload!
    // Since Peer waits 12000ms before booting, Genesis needs to idle here.
    console.log(`[Genesis] Server Aborted: ${NEXUS_DAEMON["serverAbortController"].signal.aborted}`);
    await delay(15000);

    // Wait for peer to catch up and reach 150
    for (let i = 100; i < 150; i++) {
       await PULSE.tick();
    }
    const hash150 = await PULSE.generateEpochProof(150);
    console.log(`FINAL_HASH:${hash150}`);

    // Flush and exit
    PULSE.stopWorkers();
    NEXUS_DAEMON.stop();
    Deno.exit(0);
  } else if (role === "peer") {
    // Peer connects to Genesis natively via args
    NEXUS_DAEMON.seedNodes = [`ws://127.0.0.1:${peerPort}`];
    
    // Give genesis time to reach tick 100
    await delay(12000);

    // Booting peer... it should block until Genesis payload is received
    await PULSE.initWorkers();
    
    // Wait for sync request processing
    await delay(200);
    
    const tickAfterSync = Atomics.load(STATE_MATRIX.tickCounter, 0);
    console.log(`SYNCED_TICK:${tickAfterSync}`);

    // Tick it up to 150 (from wherever it landed, presumably 100)
    const ticksTo150 = 150 - tickAfterSync;
    for (let i = 0; i < ticksTo150; i++) {
        await PULSE.tick();
    }
    const tickEOF = Atomics.load(STATE_MATRIX.tickCounter, 0);
    const hash150 = await PULSE.generateEpochProof(tickEOF);
    console.log(`FINAL_HASH:${hash150}`);

    PULSE.stopWorkers();
    NEXUS_DAEMON.stop();
    Deno.exit(0);
  }
} else {
  // --- Orchestrator ---
  async function runMaster() {
    console.log("🧪 [TEST] Genesis Block & Hot State Merging");
    
    try { Deno.removeSync("tests/.genesis_port"); } catch {}

    const genesisNode = new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", "--unstable", import.meta.url, "run-node", "genesis", "0", "0"],
      stdout: "piped",
      stderr: "inherit",
    }).spawn();

    let dynamicPeerPort = 0;
    for (let i = 0; i < 50; i++) {
        try {
           dynamicPeerPort = parseInt(Deno.readTextFileSync("tests/.genesis_port"), 10);
           if (!isNaN(dynamicPeerPort) && dynamicPeerPort > 0) break;
        } catch {}
        await delay(200);
    }
    console.log(`[TEST] Detected dynamic Genesis Port: ${dynamicPeerPort}`);

    const peerNode = new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", "--unstable", import.meta.url, "run-node", "peer", "0", dynamicPeerPort.toString()],
      stdout: "piped",
      stderr: "inherit",
    }).spawn();

    let genesisFinalHash = "";
    let peerFinalHash = "";
    let peerSyncedTick = 0;

    const readStream = async (stream: ReadableStream, role: string) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.trim() === "") continue;
          
          if (line.includes("HASH_100:")) {
             console.log(`[${role}] Reached Tick 100 Hash: ${line.split(":")[1]}`);
          } else if (line.includes("SYNCED_TICK:")) {
             peerSyncedTick = parseInt(line.split(":")[1], 10);
             console.log(`[${role}] Synced Native Matrix to Tick: ${peerSyncedTick}`);
          } else if (line.includes("FINAL_HASH:")) {
             const hash = line.split(":")[1].trim();
             if (role === "Genesis") genesisFinalHash = hash;
             if (role === "Peer") peerFinalHash = hash;
             console.log(`[${role}] Final Hash at 150: ${hash}`);
          } else {
             console.log(`[${role}] ${line.trim()}`);
          }
        }
      }
    };

    const gPromise = readStream(genesisNode.stdout, "Genesis");
    const pPromise = readStream(peerNode.stdout, "Peer");

    await Promise.all([
       genesisNode.status,
       peerNode.status,
       gPromise,
       pPromise
    ]);

    console.log(`📊 [RESULTS] Genesis Hash: ${genesisFinalHash} | Peer Hash: ${peerFinalHash}`);

    if (peerSyncedTick !== 100) {
       console.error(`❌ [TEST FAILS] Peer Node failed to Hot Merge State Matrix! Synced Tick bounded to ${peerSyncedTick} instead of 100.`);
       Deno.exit(1);
    }
    
    if (!genesisFinalHash || !peerFinalHash) {
       console.error(`❌ [TEST FAILS] A node failed to compute final hashes.`);
       Deno.exit(1);
    }

    if (genesisFinalHash !== peerFinalHash) {
       console.error(`❌ [TEST FAILS] Determinism drifted after Genesis payload merge!`);
       Deno.exit(1);
    }

    // Pass
    assertEquals(genesisFinalHash, peerFinalHash);
    console.log("✅ [TEST] Genesis Block Hot State Merging Verified.");
  }

  runMaster().catch((err) => {
    console.error("❌", err);
    Deno.exit(1);
  });
}
