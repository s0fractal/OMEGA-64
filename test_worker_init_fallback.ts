Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "0");
Deno.env.set("OMEGA_WORKER_INIT_FALLBACK", "1");
Deno.env.set("OMEGA_FORCE_WORKER_INIT_FAIL", "nonzero");

const { PULSE } = await import("./PULSE.ts");
const { STATE_MATRIX } = await import("./STATE_MATRIX.ts");

async function main() {
  console.log("🧪 [TEST] Worker init fallback (forced init failure)");

  try {
    STATE_MATRIX.clear();
    await PULSE.initWorkers();

    const status = PULSE.getStartupSelfTestStatus();
    const runtimeWorkerCount = PULSE.getRuntimeWorkerCount();
    const faults = PULSE.getWorkerFaultStats();

    console.log(
      `   initFallbackActivated=${status.initFallbackActivated} runtimeWorkers=${runtimeWorkerCount} faultStats=${faults.length}`,
    );

    if (!status.initFallbackEnabled) {
      throw new Error("[TEST] init fallback should be enabled.");
    }
    if (!status.initFallbackActivated) {
      throw new Error(
        "[TEST] init fallback should activate on forced failure.",
      );
    }
    if (runtimeWorkerCount !== 1) {
      throw new Error(
        `[TEST] expected runtime workers=1, got=${runtimeWorkerCount}`,
      );
    }
    if (faults.length !== 1) {
      throw new Error(
        `[TEST] expected fault stats for 1 worker, got=${faults.length}`,
      );
    }
    if (
      typeof status.initFallbackReason !== "string" ||
      status.initFallbackReason.length === 0
    ) {
      throw new Error("[TEST] init fallback reason missing.");
    }

    await PULSE.tick();
    console.log("✅ [TEST] Worker init fallback verified.");
  } finally {
    PULSE.stopWorkers();
    Deno.env.delete("OMEGA_FORCE_WORKER_INIT_FAIL");
    Deno.env.delete("OMEGA_WORKER_INIT_FALLBACK");
    Deno.env.delete("OMEGA_STARTUP_SELFTEST");
  }
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
