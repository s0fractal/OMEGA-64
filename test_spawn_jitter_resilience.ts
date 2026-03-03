import * as OFFSETS from "./OFFSETS.ts";

const timeoutMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_RESPONSE_TIMEOUT_MS") ?? "10", 10);
const retryCount = Number.parseInt(Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_COUNT") ?? "3", 10);
const retryMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_MS") ?? "70", 10);
const jitterMinMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_JITTER_MIN_MS") ?? "12", 10);
const jitterMaxMs = Number.parseInt(Deno.env.get("OMEGA_WORKER_JITTER_MAX_MS") ?? "30", 10);
const ticks = Number.parseInt(Deno.env.get("OMEGA_SPAWN_JITTER_TICKS") ?? "16", 10);
const seed = Number.parseInt(Deno.env.get("OMEGA_SPAWN_JITTER_SEED") ?? "424242", 10);
const replicators = Number.parseInt(Deno.env.get("OMEGA_SPAWN_JITTER_REPLICATORS") ?? "10", 10);
const architects = Number.parseInt(Deno.env.get("OMEGA_SPAWN_JITTER_ARCHITECTS") ?? "6", 10);
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

const SPAWN_RING_CAPACITY = 1024;
const WORLD_MAX_X = 1399;
const WORLD_MAX_Y = 799;

const makeReplicatorScript = (): Uint8Array => {
    const script = new Uint8Array(64);
    let pc = 0;
    script[pc++] = STATE_MATRIX.RISC.OP_REPLICATE;
    script[pc++] = STATE_MATRIX.RISC.OP_SIGNAL;
    script[pc++] = STATE_MATRIX.RISC.OP_JMP;
    script[pc++] = 0;
    return script;
};

const makeArchitectScript = (): Uint8Array => {
    const script = new Uint8Array(64);
    let pc = 0;
    script[pc++] = STATE_MATRIX.RISC.OP_ROLE;
    script[pc++] = 0;
    script[pc++] = STATE_MATRIX.ROLE_ARCHITECT;
    script[pc++] = STATE_MATRIX.RISC.OP_BUILD;
    script[pc++] = 1;
    script[pc++] = 1;
    script[pc++] = STATE_MATRIX.RISC.OP_SIGNAL;
    script[pc++] = STATE_MATRIX.RISC.OP_JMP;
    script[pc++] = 0;
    return script;
};

const seedScenario = (): number => {
    STATE_MATRIX.clear();
    Atomics.store(STATE_MATRIX.syncState, 0, STATE_MATRIX.SYNC.IDLE);
    Atomics.store(STATE_MATRIX.tickCounter, 0, 1);

    const repScript = makeReplicatorScript();
    const archScript = makeArchitectScript();

    for (let i = 0; i < replicators; i++) {
        const idx = 1000 + i * 197;
        const x = 180 + (i % 5) * 220;
        const y = 120 + Math.floor(i / 5) * 220;
        const id = (BigInt(seed >>> 0) << 32n) ^ BigInt(idx + 1);
        const genome = new Uint8Array(8);
        genome[0] = (seed + i * 17) & 0xff;
        genome[1] = (seed >>> 8) & 0xff;
        genome[2] = 0xAA;
        genome[3] = i & 0xff;
        STATE_MATRIX.seedAtom(idx, id, x, y, 3200, 260 + (i % 7), genome, repScript);
        STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_PRODUCER);
    }

    for (let i = 0; i < architects; i++) {
        const idx = 5000 + i * 211;
        const x = 420 + (i % 3) * 150;
        const y = 280 + Math.floor(i / 3) * 150;
        const id = ((BigInt(seed >>> 0) << 32n) ^ 0xABCDEF00n) + BigInt(i + 1);
        const genome = new Uint8Array(8);
        genome[0] = 0xF0;
        genome[1] = (seed + i * 13) & 0xff;
        genome[2] = 0x0D;
        genome[3] = 0x42;
        STATE_MATRIX.seedAtom(idx, id, x, y, 2600, 180 + (i % 5), genome, archScript);
        STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_ARCHITECT);
    }

    return replicators + architects;
};

const assertWorldInvariants = (): number => {
    const active = STATE_MATRIX.getActiveIndices();
    for (const idx of active) {
        const id = STATE_MATRIX.getId(idx);
        if (id === 0n) {
            throw new Error(`[TEST] Active index ${idx} has zero id.`);
        }
        const x = STATE_MATRIX.getX(idx);
        const y = STATE_MATRIX.getY(idx);
        if (x < 0 || x > WORLD_MAX_X || y < 0 || y > WORLD_MAX_Y) {
            throw new Error(`[TEST] Atom ${idx} out of bounds: (${x},${y}).`);
        }
    }
    return active.length;
};

async function main() {
    console.log(
        `🧪 [TEST] Spawn+jitter resilience workers=4 ticks=${ticks} seed=${seed} reps=${replicators} arch=${architects} timeout=${timeoutMs} retryCount=${retryCount} retryMs=${retryMs} jitter=[${jitterMinMs},${jitterMaxMs}]ms`,
    );

    const spawnHead = new Int32Array(STATE_MATRIX.buffer, OFFSETS.SPAWN_REQUESTS_OFFSET, 2);

    try {
        const initialActive = seedScenario();
        await PULSE.initWorkers();
        await PULSE.setWorkerDebugDelay(0);
        await PULSE.setWorkerDebugJitter(jitterMinMs, jitterMaxMs);

        let peakActive = initialActive;
        let finalActive = initialActive;

        for (let t = 0; t < ticks; t++) {
            await PULSE.tick();

            const active = assertWorldInvariants();
            peakActive = Math.max(peakActive, active);
            finalActive = active;

            const writeHead = Atomics.load(spawnHead, 0);
            const readHead = Atomics.load(spawnHead, 1);
            const backlog = (writeHead - readHead + SPAWN_RING_CAPACITY) % SPAWN_RING_CAPACITY;

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
                throw new Error(`[TEST] Expected zero failures for worker-${w.workerIndex}, got=${w.failures}`);
            }
        }

        if (peakActive <= initialActive) {
            throw new Error(`[TEST] Expected spawn growth under pressure (initial=${initialActive}, peak=${peakActive}).`);
        }
        if (totalRetries < 4) {
            throw new Error(`[TEST] Expected retries across spawn+jitter run, got totalRetries=${totalRetries}`);
        }

        if (captureMode) {
            console.log(
                `${CAPTURE_MARKER}${JSON.stringify({
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
                })}`,
            );
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
