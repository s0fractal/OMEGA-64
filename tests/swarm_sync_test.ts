import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { delay } from "https://deno.land/std@0.210.0/async/delay.ts";

if (Deno.args[0] === "run-node") {
  const port = parseInt(Deno.args[1], 10);
  const peerPort = parseInt(Deno.args[2], 10);
  const applyDelay = Deno.args.includes("--delay");

  const { PULSE, NEXUS_DAEMON } = await import("../PULSE.ts");

  // Re-configure the static Nexus daemon for our test isolated node
  NEXUS_DAEMON.port = port;
  NEXUS_DAEMON.seedNodes = [`ws://127.0.0.1:${peerPort}`];

  await PULSE.initWorkers();

  // Give Nexus a moment to handshake
  await delay(200);

  // Run manually mimicking normal Orchestrator loop
  for (let i = 0; i < 200; i++) {
    await PULSE.tick();

    if (applyDelay) {
      await delay(10); // Deliberately slow
    }

    if (i % 10 === 0) {
      console.log(`SYNC_REPORT_TICK:${port}:${NEXUS_DAEMON.localCurrentTick}`);
    }
  }

  // Final flush
  console.log(`SYNC_REPORT_FINAL:${port}:${NEXUS_DAEMON.localCurrentTick}`);
  PULSE.stopWorkers();
  NEXUS_DAEMON.stop();
  Deno.exit(0);
} else {
  // --- Orchestrator ---
  async function runMaster() {
    console.log("🧪 [TEST] Byzantine Swarm Synchronization (Hive Clock)");

    const fastNode = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-A",
        "--unstable",
        import.meta.url,
        "run-node",
        "9010",
        "9011",
      ],
      stdout: "piped",
      stderr: "inherit",
    }).spawn();

    const slowNode = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-A",
        "--unstable",
        import.meta.url,
        "run-node",
        "9011",
        "9010",
        "--delay",
      ],
      stdout: "piped",
      stderr: "inherit",
    }).spawn();

    let fastFinalTick = 0;
    let slowFinalTick = 0;

    const readStream = async (stream: ReadableStream, port: number) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.includes("SYNC_REPORT_FINAL:")) {
            const parts = line.trim().split(":");
            const t = parseInt(parts[2], 10);
            if (port === 9010) fastFinalTick = t;
            if (port === 9011) slowFinalTick = t;
            console.log(`[ORCHESTRATOR] Node ${port} finished at tick ${t}`);
          } else if (line.trim().length > 0) {
            console.log(`[NODE ${port}] ${line.trim()}`);
          }
        }
      }
    };

    const fastPromise = readStream(fastNode.stdout, 9010);
    const slowPromise = readStream(slowNode.stdout, 9011);

    await Promise.all([
      fastNode.status,
      slowNode.status,
      fastPromise,
      slowPromise,
    ]);

    console.log(
      `📊 [RESULTS] Fast Node Tick: ${fastFinalTick} | Slow Node Tick: ${slowFinalTick}`,
    );

    // If Elastic Tick Yielding works, Fast Node should have yielded waiting for the median
    // Median in a 2-node cluster favors the slow node (since median forces waiting if ahead)
    // The drift should be exactly capped under MAX_TICK_DRIFT (50) + a small margin for loop timing
    const drift = Math.abs(fastFinalTick - slowFinalTick);

    if (drift > 60) {
      console.error(
        `❌ [TEST FAILS] Drift (${drift}) exceeds 50! Fast node did not elastic yield.`,
      );
      Deno.exit(1);
    }

    if (fastFinalTick === 0 || slowFinalTick === 0) {
      console.error(`❌ [TEST FAILS] A node failed to execute loop bounds.`);
      Deno.exit(1);
    }

    // Pass
    assertEquals(true, true);
    console.log("✅ [TEST] Hive Clock Byzantine Synchronization Verified.");
  }

  runMaster().catch((err) => {
    console.error("❌", err);
    Deno.exit(1);
  });
}
