import { emitResilienceCapture } from "@02/03_tests/worker_resilience_capture.ts";

const timeoutMs = Number.parseInt(
  Deno.env.get("OMEGA_WORKER_RESPONSE_TIMEOUT_MS") ?? "8",
  10,
);
const retryCount = Number.parseInt(
  Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_COUNT") ?? "2",
  10,
);
const retryMs = Number.parseInt(
  Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_MS") ?? "45",
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
  Deno.env.get("OMEGA_WORKER_JITTER_TICKS") ?? "6",
  10,
);
const captureMode = Deno.args.includes("--capture");

Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "0");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "0");
Deno.env.set("OMEGA_WORKER_RESPONSE_TIMEOUT_MS", String(timeoutMs));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_COUNT", String(retryCount));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_MS", String(retryMs));

const { PULSE } = await import("@02/PULSE.ts");
const { STATE_MATRIX } = await import("@00");

async function main() {
  console.log(
    `🧪 [TEST] Worker jitter resilience workers=4 ticks=${ticks} timeout=${timeoutMs} retryCount=${retryCount} retryMs=${retryMs} jitter=[${jitterMinMs},${jitterMaxMs}]ms`,
  );

  try {
    STATE_MATRIX.clear();
    await PULSE.initWorkers();
    await PULSE.setWorkerDebugDelay(0);
    await PULSE.setWorkerDebugJitter(jitterMinMs, jitterMaxMs);

    for (let t = 0; t < ticks; t++) {
      await PULSE.tick();
      const active = STATE_MATRIX.getActiveIndices().length;
      const id0 = STATE_MATRIX.getId(0);
      console.log(`   [TICK ${t}] active=${active} id0=${id0}`);
      if (active !== 0 || id0 !== 0n) {
        throw new Error(
          `[TEST] Matrix drift detected at tick=${t} (active=${active}, id0=${id0}).`,
        );
      }
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

    if (totalRetries < 4) {
      throw new Error(
        `[TEST] Expected retries across jitter run, got totalRetries=${totalRetries}`,
      );
    }

    if (captureMode) {
      emitResilienceCapture({
        scenario: "worker-jitter-resilience",
        workerCount: 4,
        timeoutMs,
        retryCount,
        retryMs,
        jitterMinMs,
        jitterMaxMs,
        ticks,
        totalRetries,
        totalFailures: stats.reduce((acc, w) => acc + w.failures, 0),
        stats,
      });
    }

    await PULSE.setWorkerDebugJitter(0, 0);
    console.log("✅ [TEST] Worker jitter resilience verified.");
  } finally {
    PULSE.stopWorkers();
  }
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
