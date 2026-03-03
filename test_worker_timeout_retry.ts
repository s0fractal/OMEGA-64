const timeoutMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_RESPONSE_TIMEOUT_MS") ?? "8", 10);
const retryCount = Number.parseInt(Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_COUNT") ?? "2", 10);
const retryMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_MS") ?? "45", 10);
const debugDelayMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_DEBUG_DELAY_MS") ?? "20", 10);
const CAPTURE_MARKER = "__OMEGA_RESILIENCE_CAPTURE__";
const captureMode = Deno.args.includes("--capture");

Deno.env.set("OMEGA_PULSE_WORKERS", "1");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "1");
Deno.env.set("OMEGA_WORKER_RESPONSE_TIMEOUT_MS", String(timeoutMs));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_COUNT", String(retryCount));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_MS", String(retryMs));

const { PULSE } = await import("./PULSE.ts");
const { STATE_MATRIX } = await import("./STATE_MATRIX.ts");

async function main() {
    console.log(
        `🧪 [TEST] Worker timeout retry resilience timeout=${timeoutMs}ms retryCount=${retryCount} retryMs=${retryMs} debugDelay=${debugDelayMs}ms`,
    );

    try {
        STATE_MATRIX.clear();
        await PULSE.initWorkers();
        await PULSE.setWorkerDebugDelay(debugDelayMs);

        // Empty tick still traverses all worker phases and is enough to validate timeout retries.
        await PULSE.tick();

        const stats = PULSE.getWorkerFaultStats();
        if (stats.length !== 1) {
            throw new Error(`[TEST] Expected exactly one worker stat, got=${stats.length}`);
        }

        const w0 = stats[0];
        console.log(
            `   worker0 requests=${w0.requests} completed=${w0.completed} timeouts=${w0.timeouts} retries=${w0.retryWaits} failures=${w0.failures}`,
        );

        if (w0.retryWaits < 1) {
            throw new Error("[TEST] Expected at least one retry wait window.");
        }
        if (w0.failures !== 0) {
            throw new Error(`[TEST] Expected zero worker failures, got=${w0.failures}`);
        }

        if (captureMode) {
            console.log(
                `${CAPTURE_MARKER}${JSON.stringify({
                    scenario: "worker-timeout-retry",
                    workerCount: 1,
                    timeoutMs,
                    retryCount,
                    retryMs,
                    debugDelayMs,
                    totalRetries: w0.retryWaits,
                    totalFailures: w0.failures,
                    stats: [w0],
                })}`,
            );
        }

        await PULSE.setWorkerDebugDelay(0);
        console.log("✅ [TEST] Worker timeout retry resilience verified.");
    } finally {
        PULSE.stopWorkers();
    }
}

main().catch((err) => {
    console.error("❌ [TEST]", err);
    Deno.exit(1);
});
