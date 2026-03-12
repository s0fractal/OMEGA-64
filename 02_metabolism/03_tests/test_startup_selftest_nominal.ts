Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST_TICKS", "2");
Deno.env.set("OMEGA_STARTUP_SELFTEST_FALLBACK", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST_QUIET", "1");
Deno.env.delete("OMEGA_STARTUP_SELFTEST_FORCE_BREACH");

const { PULSE } = await import("../PULSE.ts");
const { STATE_MATRIX } = await import("../../00_substrate/mod.ts");

function assertNominalStartup(expectedWorkers: number): void {
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
  if (status.fallbackActivated) {
    throw new Error(
      "[TEST] Startup fallback must not activate in nominal run.",
    );
  }
  if (status.lastBreachTick !== -1) {
    throw new Error(
      `[TEST] Expected no startup breach, got tick=${status.lastBreachTick}`,
    );
  }
  if (runtimeWorkerCount !== expectedWorkers) {
    throw new Error(
      `[TEST] Expected runtime workers=${expectedWorkers}, got=${runtimeWorkerCount}`,
    );
  }
  if (faults.length !== expectedWorkers) {
    throw new Error(
      `[TEST] Expected fault stats for ${expectedWorkers} workers, got=${faults.length}`,
    );
  }
  if (
    STATE_MATRIX.getActiveIndices().length !== 0 || STATE_MATRIX.getId(0) !== 0n
  ) {
    throw new Error("[TEST] Matrix must remain empty after startup self-test.");
  }
}

async function main() {
  console.log("🧪 [TEST] Startup self-test nominal path (no fallback)");

  try {
    STATE_MATRIX.clear();
    await PULSE.initWorkers();
    assertNominalStartup(4);

    await PULSE.tick();
    if (
      STATE_MATRIX.getActiveIndices().length !== 0 ||
      STATE_MATRIX.getId(0) !== 0n
    ) {
      throw new Error(
        "[TEST] Matrix must stay empty after first nominal tick.",
      );
    }

    PULSE.stopWorkers();
    const afterStop = PULSE.getStartupSelfTestStatus();
    if (
      afterStop.done || afterStop.fallbackActivated ||
      afterStop.lastBreachTick !== -1
    ) {
      throw new Error(
        "[TEST] stopWorkers() must reset startup self-test cold-start state.",
      );
    }

    await PULSE.initWorkers();
    assertNominalStartup(4);

    console.log("✅ [TEST] Startup self-test nominal path verified.");
  } finally {
    PULSE.stopWorkers();
  }
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
