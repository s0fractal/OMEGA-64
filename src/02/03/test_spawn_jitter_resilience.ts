import { SPAWN_REQUESTS_OFFSET } from "@generated";
import { emitResilienceCapture } from "@02/03/worker_resilience_capture.ts";
import {
  assertSeededSwarmWorldInvariants,
  seedSeededSwarmScenario,
  SPAWN_RING_CAPACITY,
} from "@02/03/worker_seeded_swarm.ts";

const timeoutMs = Number.parseInt(
  Deno.env.get("OMEGA_WORKER_RESPONSE_TIMEOUT_MS") ?? "10",
  10,
);
const retryCount = Number.parseInt(
  Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_COUNT") ?? "4",
  10,
);
const retryMs = Number.parseInt(
  Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_MS") ?? "70",
  10,
);
const jitterMinMs = Number.parseInt(
  Deno.env.get("OMEGA_WORKER_JITTER_MIN_MS") ?? "12",
  10,
);
const jitterMaxMs = Number.parseInt(
  Deno.env.get("OMEGA_WORKER_JITTER_MAX_MS") ?? "30",
  10,
);
const ticks = Number.parseInt(
  Deno.env.get("OMEGA_SPAWN_JITTER_TICKS") ?? "64",
  10,
);
const seed = Number.parseInt(
  Deno.env.get("OMEGA_SPAWN_JITTER_SEED") ?? "424242",
  10,
);
const replicators = Number.parseInt(
  Deno.env.get("OMEGA_SPAWN_JITTER_REPLICATORS") ?? "10",
  10,
);
const architects = Number.parseInt(
  Deno.env.get("OMEGA_SPAWN_JITTER_ARCHITECTS") ?? "6",
  10,
);
const captureMode = Deno.args.includes("--capture");

Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "0");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "0");
Deno.env.set("OMEGA_WORKER_RESPONSE_TIMEOUT_MS", String(timeoutMs));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_COUNT", String(retryCount));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_MS", String(retryMs));

const { PULSE } = await import("../../_/04/PULSE.ts");
const { STATE_MATRIX } = await import("@00");

async function main() {
  console.log(
    `🧪 [TEST] Spawn+jitter resilience workers=4 ticks=${ticks} seed=${seed} reps=${replicators} arch=${architects} timeout=${timeoutMs} retryCount=${retryCount} retryMs=${retryMs} jitter=[${jitterMinMs},${jitterMaxMs}]ms`,
  );

  const spawnHead = new Int32Array(
    STATE_MATRIX.buffer,
    SPAWN_REQUESTS_OFFSET,
    2,
  );

  try {
    const initialActive = seedSeededSwarmScenario(STATE_MATRIX, {
      seed,
      replicators,
      architects,
    });
    await PULSE.initWorkers();
    await PULSE.setWorkerDebugDelay(0);
    await PULSE.setWorkerDebugJitter(jitterMinMs, jitterMaxMs);

    let peakActive = initialActive;
    let finalActive = initialActive;

    for (let t = 0; t < ticks; t++) {
      await PULSE.tick();

      const active = assertSeededSwarmWorldInvariants(STATE_MATRIX, "[TEST]");
      peakActive = Math.max(peakActive, active);
      finalActive = active;

      const writeHead = Atomics.load(spawnHead, 0);
      const readHead = Atomics.load(spawnHead, 1);
      const backlog = (writeHead - readHead + SPAWN_RING_CAPACITY) %
        SPAWN_RING_CAPACITY;

      console.log(`   [TICK ${t}] active=${active} spawnBacklog=${backlog}`);
    }

    const stats = PULSE.getWorkerFaultStats();
    if (stats.length !== 4) {
      throw new Error(`[TEST] Expected 4 worker stats, got=${stats.length}`);
    }

    let totalRetries = 0;
    for (const w of stats) {
      totalRetries += w.retryWaits;
      console.log(
        `   worker${w.workerIndex} requests=${w.requests} completed=${w.completed} timeouts=${w.timeouts} retries=${w.retryWaits} failures=${w.failures}`,
      );
      if (w.failures !== 0) {
        throw new Error(
          `[TEST] Expected zero failures for worker-${w.workerIndex}, got=${w.failures}`,
        );
      }
    }

    if (peakActive <= initialActive) {
      throw new Error(
        `[TEST] Expected spawn growth under pressure (initial=${initialActive}, peak=${peakActive}).`,
      );
    }
    if (totalRetries < 4) {
      throw new Error(
        `[TEST] Expected retries across spawn+jitter run, got totalRetries=${totalRetries}`,
      );
    }

    if (captureMode) {
      emitResilienceCapture({
        scenario: "spawn-jitter-resilience",
        workerCount: 4,
        timeoutMs,
        retryCount,
        retryMs,
        jitterMinMs,
        jitterMaxMs,
        ticks,
        seed,
        replicators,
        architects,
        initialActive,
        finalActive,
        peakActive,
        totalRetries,
        totalFailures: stats.reduce((acc, w) => acc + w.failures, 0),
        stats,
      });
    }

    await PULSE.setWorkerDebugJitter(0, 0);
    console.log("✅ [TEST] Spawn+jitter resilience verified.");
  } finally {
    PULSE.stopWorkers();
  }
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
