Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "0");
Deno.env.set("OMEGA_WORKER_INIT_FALLBACK", "1");
Deno.env.set("OMEGA_WASM_BOOT_POLICY", "safe-noop");
Deno.env.set("OMEGA_FORCE_WORKER_INIT_FAIL", "all");

const { PULSE } = await import("../../_/04/PULSE.ts");
const { STATE_MATRIX } = await import("@00");

async function main() {
  console.log("🧪 [TEST] Worker init total-fail (safe-noop policy)");

  try {
    STATE_MATRIX.clear();
    await PULSE.initWorkers();

    const status = PULSE.getStartupSelfTestStatus();
    const runtimeWorkerCount = PULSE.getRuntimeWorkerCount();
    const faults = PULSE.getWorkerFaultStats();

    console.log(
      `   runtimeWorkers=${runtimeWorkerCount} faultStats=${faults.length} wasmBootDegraded=${status.wasmBootDegraded}`,
    );

    if (runtimeWorkerCount !== 0) {
      throw new Error(
        `[TEST] expected runtime workers=0, got=${runtimeWorkerCount}`,
      );
    }
    if (!status.wasmBootDegraded) {
      throw new Error("[TEST] safe-noop policy must enter degraded mode.");
    }
    if (
      typeof status.wasmBootReason !== "string" ||
      status.wasmBootReason.length === 0
    ) {
      throw new Error("[TEST] missing wasmBootReason in safe-noop mode.");
    }
    if (faults.length !== 0) {
      throw new Error(
        `[TEST] expected fault stats for 0 workers, got=${faults.length}`,
      );
    }

    await PULSE.tick();
    if (
      STATE_MATRIX.getActiveIndices().length !== 0 ||
      STATE_MATRIX.getId(0) !== 0n
    ) {
      throw new Error("[TEST] matrix must remain empty in safe-noop mode.");
    }

    console.log("✅ [TEST] Worker init total-fail safe-noop verified.");
  } finally {
    PULSE.stopWorkers();
    Deno.env.delete("OMEGA_FORCE_WORKER_INIT_FAIL");
    Deno.env.delete("OMEGA_WASM_BOOT_POLICY");
    Deno.env.delete("OMEGA_WORKER_INIT_FALLBACK");
    Deno.env.delete("OMEGA_STARTUP_SELFTEST");
  }
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
