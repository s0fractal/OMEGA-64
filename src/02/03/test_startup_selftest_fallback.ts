Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST_TICKS", "2");
Deno.env.set("OMEGA_STARTUP_SELFTEST_FALLBACK", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST_FORCE_BREACH", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST_QUIET", "1");

const { PULSE } = await import("@generated");
const { MX } = await import("@00");

async function main() {
  console.log("🧪 [TEST] Startup self-test fallback to single worker");

  try {
    MX.clear();
    await PULSE.initWorkers();

    const status = PULSE.getStartupSelfTestStatus();
    const runtimeWorkerCount = PULSE.getRuntimeWorkerCount();
    const faults = PULSE.getWorkerFaultStats();

    console.log(
      `   startup done=${status.done} fallbackActivated=${status.fallbackActivated} lastBreachTick=${status.lastBreachTick}`,
    );
    console.log(
      `   runtime workers=${runtimeWorkerCount} faultStats=${faults.length}`,
    );

    if (!status.done) {
      throw new Error("[TEST] Startup self-test did not complete.");
    }
    if (!status.fallbackActivated) {
      throw new Error("[TEST] Startup fallback was not activated.");
    }
    if (runtimeWorkerCount !== 1) {
      throw new Error(
        `[TEST] Expected runtime workers=1, got=${runtimeWorkerCount}`,
      );
    }
    if (faults.length !== 1) {
      throw new Error(
        `[TEST] Expected fault stats for exactly one worker, got=${faults.length}`,
      );
    }
    if (
      MX.getActiveIndices().length !== 0 ||
      MX.getId(0) !== 0n
    ) {
      throw new Error(
        "[TEST] Matrix must remain empty after startup self-test.",
      );
    }

    await PULSE.tick();
    console.log("✅ [TEST] Startup self-test fallback verified.");
  } finally {
    PULSE.stopWorkers();
  }
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
