import { PULSE } from "./PULSE.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_DETERMINISM_CAPTURE__";
const DEFAULT_TICKS = 24;
const DEFAULT_SEED = 1337;
const DEFAULT_ATOMS = 16;

type CapturePayload = {
    workerCount: number;
    strictDeterminism: boolean;
    seed: number;
    ticks: number;
    atomCount: number;
    hash: string;
    snapshot: Snapshot;
};

type Snapshot = {
    activeCount: number;
    tickCounter: number;
    atoms: AtomState[];
    structureSlice: number[];
    signalSlice: number[];
};

type AtomState = {
    idx: number;
    id: string;
    role: number;
    x: number;
    y: number;
    energy: number;
    resonance: number;
    phase: number;
    pc: number;
    logic: number[];
    bonds: number[];
    bondDistances: number[];
    damping: number;
};

const parseEnvInt = (name: string, fallback: number, min: number, max: number): number => {
    const raw = Deno.env.get(name);
    if (!raw) return fallback;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
};

const makePrng = (seed: number): (() => number) => {
    let s = (seed | 0) || 1;
    return () => {
        s ^= s << 13;
        s ^= s >>> 17;
        s ^= s << 5;
        return s >>> 0;
    };
};

const randInt = (next: () => number, min: number, max: number): number => {
    if (max <= min) return min;
    const span = max - min + 1;
    return min + (next() % span);
};

const roleAt = (ord: number, next: () => number): number => {
    const roles = [
        STATE_MATRIX.ROLE_PRODUCER,
        STATE_MATRIX.ROLE_NEUTRAL,
        STATE_MATRIX.ROLE_GUARDIAN,
        STATE_MATRIX.ROLE_PARASITE,
    ];
    return roles[(ord + (next() & 3)) & 3];
};

const buildAtomIndices = (count: number): number[] => {
    const out: number[] = [];
    const perBand = Math.ceil(count / 4);
    for (let band = 0; band < 4 && out.length < count; band++) {
        const base = band * 25_000 + 100;
        for (let k = 0; k < perBand && out.length < count; k++) {
            out.push(base + k * 137);
        }
    }
    return out;
};

const hashHex = async (payload: string): Promise<string> => {
    const bytes = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

const seedScenario = (seed: number, atomCount: number): number[] => {
    STATE_MATRIX.clear();
    Atomics.store(STATE_MATRIX.syncState, 0, STATE_MATRIX.SYNC.IDLE);
    Atomics.store(STATE_MATRIX.tickCounter, 0, 1);

    const next = makePrng(seed);
    const indices = buildAtomIndices(atomCount);

    for (let ord = 0; ord < indices.length; ord++) {
        const idx = indices[ord];
        const role = roleAt(ord, next);
        const x = randInt(next, 280, 1120);
        const y = randInt(next, 140, 680);
        const resonance = role === STATE_MATRIX.ROLE_GUARDIAN
            ? randInt(next, 80, 220)
            : randInt(next, 10, 120);
        const energy = role === STATE_MATRIX.ROLE_PRODUCER
            ? randInt(next, 900, 1600)
            : randInt(next, 250, 900);
        const id = (BigInt(seed >>> 0) << 32n) ^ BigInt(idx + 1);

        const logic = new Uint8Array(8);
        for (let b = 0; b < logic.length; b++) {
            logic[b] = randInt(next, 0, 255);
        }

        STATE_MATRIX.seedAtom(idx, id, x, y, energy, resonance, logic);
        STATE_MATRIX.setRole(idx, role);
        STATE_MATRIX.setDamping(idx, randInt(next, 0, 30));
    }

    // Deterministic but seed-variant bond topology with cross-band links.
    for (let i = 0; i < indices.length; i++) {
        const a = indices[i];
        const partnerOffset = 1 + (next() % Math.max(1, indices.length - 1));
        const b = indices[(i + partnerOffset) % indices.length];
        const slotA = i & 3;
        const slotB = (i + 1) & 3;
        const stiffness = 0.65 + ((next() % 25) / 100);
        const dist = randInt(next, 45, 95);

        STATE_MATRIX.setBondTarget(a, slotA, b);
        STATE_MATRIX.setBondStiffness(a, slotA, stiffness);
        STATE_MATRIX.setBondDistance(a, slotA, dist);

        STATE_MATRIX.setBondTarget(b, slotB, a);
        STATE_MATRIX.setBondStiffness(b, slotB, stiffness);
        STATE_MATRIX.setBondDistance(b, slotB, dist);
    }

    return indices;
};

const buildSnapshot = (indices: number[]): Snapshot => {
    const structureGrid = new Int32Array(STATE_MATRIX.buffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80);
    const signalGrid = new Int32Array(STATE_MATRIX.buffer, OFFSETS.SIGNAL_GRID_OFFSET, 140 * 80);

    const slice = (grid: Int32Array): number[] => {
        const out: number[] = [];
        for (let gy = 45; gy <= 60; gy++) {
            for (let gx = 45; gx <= 60; gx++) {
                out.push(grid[gy * 140 + gx]);
            }
        }
        return out;
    };

    const atoms: AtomState[] = indices.map((idx) => ({
        idx,
        id: STATE_MATRIX.getId(idx).toString(),
        role: STATE_MATRIX.getRole(idx),
        x: STATE_MATRIX.getX(idx),
        y: STATE_MATRIX.getY(idx),
        energy: Number(STATE_MATRIX.getEnergy(idx).toFixed(3)),
        resonance: STATE_MATRIX.getResonance(idx),
        phase: STATE_MATRIX.getPhase(idx),
        pc: STATE_MATRIX.getPC(idx),
        logic: Array.from(STATE_MATRIX.getLogic(idx)),
        bonds: Array.from(STATE_MATRIX.getBonds(idx)),
        bondDistances: [0, 1, 2, 3].map((slot) => STATE_MATRIX.getBondDistance(idx, slot)),
        damping: STATE_MATRIX.getDamping(idx),
    }));

    return {
        activeCount: STATE_MATRIX.getActiveIndices().length,
        tickCounter: Atomics.load(STATE_MATRIX.tickCounter, 0),
        atoms,
        structureSlice: slice(structureGrid),
        signalSlice: slice(signalGrid),
    };
};

const runCapture = async (): Promise<CapturePayload> => {
    const workerCount = parseEnvInt("OMEGA_PULSE_WORKERS", 4, 1, 32);
    const strictDeterminism = (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1";
    const seed = parseEnvInt("OMEGA_DETERMINISM_SEED", DEFAULT_SEED, 1, 0x7fffffff);
    const ticks = parseEnvInt("OMEGA_DETERMINISM_TICKS", DEFAULT_TICKS, 1, 200);
    const atomCount = parseEnvInt("OMEGA_DETERMINISM_ATOMS", DEFAULT_ATOMS, 4, 128);

    const indices = seedScenario(seed, atomCount);
    await PULSE.initWorkers();
    for (let t = 0; t < ticks; t++) {
        await PULSE.tick();
    }

    const snapshot = buildSnapshot(indices);
    const hash = await hashHex(JSON.stringify(snapshot));
    return { workerCount, strictDeterminism, seed, ticks, atomCount, hash, snapshot };
};

const runCaptureSubprocess = async (
    workerCount: number,
    strict: boolean,
    seed: number,
    ticks: number,
    atomCount: number,
): Promise<CapturePayload> => {
    const cmd = new Deno.Command(Deno.execPath(), {
        args: ["run", "-A", "test_worker_determinism.ts", "--capture"],
        env: {
            ...Deno.env.toObject(),
            OMEGA_PULSE_WORKERS: String(workerCount),
            OMEGA_STRICT_DETERMINISM: strict ? "1" : "0",
            OMEGA_DETERMINISM_SEED: String(seed),
            OMEGA_DETERMINISM_TICKS: String(ticks),
            OMEGA_DETERMINISM_ATOMS: String(atomCount),
        },
        stdout: "piped",
        stderr: "piped",
    });
    const res = await cmd.output();
    const out = new TextDecoder().decode(res.stdout);
    const err = new TextDecoder().decode(res.stderr);
    const merged = `${out}\n${err}`;

    if (res.code !== 0) {
        throw new Error(`[TEST] capture run failed (workers=${workerCount}, strict=${strict}).\n${merged}`);
    }

    const line = merged
        .split("\n")
        .map((s) => s.trim())
        .find((s) => s.startsWith(CAPTURE_MARKER));
    if (!line) {
        throw new Error(`[TEST] capture marker missing (workers=${workerCount}, strict=${strict}).\n${merged}`);
    }
    return JSON.parse(line.slice(CAPTURE_MARKER.length)) as CapturePayload;
};

const compareAtoms = (a: AtomState[], b: AtomState[]): string[] => {
    const diffs: string[] = [];
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        const aa = a[i];
        const bb = b[i];
        if (JSON.stringify(aa) !== JSON.stringify(bb)) {
            diffs.push(`idx=${aa.idx} worker1=${JSON.stringify(aa)} worker4=${JSON.stringify(bb)}`);
        }
        if (diffs.length >= 8) break;
    }
    return diffs;
};

async function main() {
    if (Deno.args.includes("--capture")) {
        const capture = await runCapture();
        console.log(`${CAPTURE_MARKER}${JSON.stringify(capture)}`);
        Deno.exit(0);
    }

    const seed = parseEnvInt("OMEGA_DETERMINISM_SEED", DEFAULT_SEED, 1, 0x7fffffff);
    const ticks = parseEnvInt("OMEGA_DETERMINISM_TICKS", DEFAULT_TICKS, 1, 200);
    const atomCount = parseEnvInt("OMEGA_DETERMINISM_ATOMS", DEFAULT_ATOMS, 4, 128);

    console.log(`🧪 [TEST] Worker determinism (1 vs 4 workers) seed=${seed} ticks=${ticks} atoms=${atomCount}`);
    const one = await runCaptureSubprocess(1, true, seed, ticks, atomCount);
    const four = await runCaptureSubprocess(4, true, seed, ticks, atomCount);

    console.log(`   workers=1 strict=${one.strictDeterminism} hash=${one.hash}`);
    console.log(`   workers=4 strict=${four.strictDeterminism} hash=${four.hash}`);

    if (one.hash !== four.hash) {
        console.error("❌ [TEST] Determinism mismatch between worker topologies.");
        const atomDiffs = compareAtoms(one.snapshot.atoms, four.snapshot.atoms);
        for (const line of atomDiffs) {
            console.error(`   ${line}`);
        }
        throw new Error("[TEST] worker determinism failed.");
    }

    console.log("✅ [TEST] Worker determinism verified.");
}

main().catch((err) => {
    console.error(err);
    Deno.exit(1);
});
