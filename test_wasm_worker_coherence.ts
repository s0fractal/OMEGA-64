import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";

const parseTickCount = (): number => {
    const raw = Deno.env.get("OMEGA_WORKER_COHERENCE_TICKS");
    if (!raw) return 12;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) return 12;
    return Math.min(10_000, n);
};

async function main() {
    const ticks = parseTickCount();
    const requestedWorkers = Deno.env.get("OMEGA_PULSE_WORKERS") ?? "4";
    console.log(`🧪 [TEST] WASM worker coherence baseline (OMEGA_PULSE_WORKERS=${requestedWorkers}, ticks=${ticks})`);

    STATE_MATRIX.clear();
    await PULSE.initWorkers();

    if (STATE_MATRIX.getActiveIndices().length !== 0) {
        throw new Error("[TEST] Matrix not empty after clear/init.");
    }

    for (let t = 0; t < ticks; t++) {
        await PULSE.tick();
        const active = STATE_MATRIX.getActiveIndices().length;
        const id0 = STATE_MATRIX.getId(0);
        console.log(`   [TICK ${t}] active=${active}, id0=${id0}`);
        if (active !== 0 || id0 !== 0n) {
            throw new Error(
                `[TEST] Coherence breach at tick ${t}: active=${active}, id0=${id0.toString()}`,
            );
        }
    }

    console.log("✅ [TEST] No spontaneous atom emergence across baseline ticks.");
}

if (import.meta.main) {
    try {
        await main();
        Deno.exit(0);
    } catch (err) {
        console.error("❌ [TEST]", err);
        Deno.exit(1);
    }
}
