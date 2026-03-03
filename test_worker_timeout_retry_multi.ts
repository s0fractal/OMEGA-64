const timeoutMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_RESPONSE_TIMEOUT_MS") ?? "8", 10);
const retryCount = Number.parseInt(Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_COUNT") ?? "2", 10);
const retryMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_MS") ?? "45", 10);
const debugDelayMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_DEBUG_DELAY_MS") ?? "20", 10);
const CAPTURE_MARKER = "__OMEGA_RESILIENCE_CAPTURE__";
const captureMode = Deno.args.includes("--capture");

Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "0");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "0");
Deno.env.set("OMEGA_WORKER_RESPONSE_TIMEOUT_MS", String(timeoutMs));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_COUNT", String(retryCount));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_MS", String(retryMs));

const { PULSE } = await import("./PULSE.ts");
const { STATE_MATRIX } = await import("./STATE_MATRIX.ts");

async function main() {
    console.log(
        `🧪 [TEST] Worker timeout retry resilience (multi-worker) timeout=${timeoutMs}ms retryCount=${retryCount} retryMs=${retryMs} debugDelay=${debugDelayMs}ms`,
    );

    try {
        STATE_MATRIX.clear();
        await PULSE.initWorkers();
        await PULSE.setWorkerDebugDelay(debugDelayMs);

        // Empty tick still traverses worker phases and is enough to validate timeout retries.
        await PULSE.tick();

        const stats = PULSE.getWorkerFaultStats();
        if (stats.length !== 4) {
            throw new Error(`[TEST] Expected exactly four worker stats, got=${stats.length}`);
        }

        let totalRetries = 0;
        for (const w of stats) {
            totalRetries += w.retryWaits;
            console.log(
                `   worker${w.workerIndex} requests=${w.requests} completed=${w.completed} timeouts=${w.timeouts} retries=${w.retryWaits} failures=${w.failures}`,
            );

            if (w.requests < 1) {
                throw new Error(`[TEST] Expected worker-${w.workerIndex} to receive requests.`);
            }
            if (w.retryWaits < 1) {
                throw new Error(`[TEST] Expected worker-${w.workerIndex} to hit at least one retry wait window.`);
            }
            if (w.failures !== 0) {
                throw new Error(`[TEST] Expected zero failures for worker-${w.workerIndex}, got=${w.failures}`);
            }
        }

        if (totalRetries < 4) {
            throw new Error(`[TEST] Expected total retries >= 4 across workers, got=${totalRetries}`);
        }

        if (captureMode) {
            console.log(
                `${CAPTURE_MARKER}${JSON.stringify({
                    scenario: "worker-timeout-retry-multi",
                    workerCount: 4,
                    timeoutMs,
                    retryCount,
                    retryMs,
                    debugDelayMs,
                    totalRetries,
                    totalFailures: stats.reduce((acc, w) => acc + w.failures, 0),
                    stats,
                })}`,
            );
        }

        await PULSE.setWorkerDebugDelay(0);
        console.log("✅ [TEST] Multi-worker timeout retry resilience verified.");
    } finally {
        PULSE.stopWorkers();
    }
}

main().catch((err) => {
    console.error("❌ [TEST]", err);
    Deno.exit(1);
});
