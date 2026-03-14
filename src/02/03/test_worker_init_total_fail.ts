Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "1");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "0");
Deno.env.set("OMEGA_WORKER_INIT_FALLBACK", "1");
Deno.env.set("OMEGA_WASM_BOOT_POLICY", "fail-fast");
Deno.env.set("OMEGA_FORCE_WORKER_INIT_FAIL", "all");

const { PULSE } = await import("../../_/05/PULSE.ts");
const { STATE_MATRIX } = await import("@00");

async function main() {
  console.log("🧪 [TEST] Worker init total-fail (fail-fast policy)");

  try {
    STATE_MATRIX.clear();
    let thrown = false;
    let failMsg = "";

    try {
      await PULSE.initWorkers();
    } catch (err) {
      thrown = true;
      failMsg = err instanceof Error ? err.message : String(err);
    }

    if (!thrown) {
      throw new Error("[TEST] initWorkers() must throw on total init failure.");
    }
    if (!failMsg.includes("Worker init fallback failed")) {
      throw new Error(`[TEST] unexpected failure message: ${failMsg}`);
    }

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
    if (faults.length !== 0) {
      throw new Error(
        `[TEST] expected fault stats for 0 workers, got=${faults.length}`,
      );
    }
    if (status.wasmBootDegraded) {
      throw new Error("[TEST] fail-fast policy must not enter safe-noop mode.");
    }

    console.log("✅ [TEST] Worker init total-fail fail-fast verified.");
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
