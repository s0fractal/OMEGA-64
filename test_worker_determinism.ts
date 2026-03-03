import { PULSE } from "./PULSE.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_DETERMINISM_CAPTURE__";
const ATOM_INDICES = [100, 1200, 25_100, 26_200, 50_100, 51_200, 75_100, 76_200];
const TICKS = 24;

type CapturePayload = {
    workerCount: number;
    strictDeterminism: boolean;
    ticks: number;
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

const atomRoleFor = (ord: number): number => {
    const roles = [
        STATE_MATRIX.ROLE_PRODUCER,
        STATE_MATRIX.ROLE_NEUTRAL,
        STATE_MATRIX.ROLE_GUARDIAN,
        STATE_MATRIX.ROLE_PARASITE,
    ];
    return roles[ord % roles.length];
};

const hashHex = async (payload: string): Promise<string> => {
    const bytes = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

const seedScenario = () => {
    STATE_MATRIX.clear();
    Atomics.store(STATE_MATRIX.syncState, 0, STATE_MATRIX.SYNC.IDLE);
    Atomics.store(STATE_MATRIX.tickCounter, 0, 1);

    const basePos = [
        [500, 500],
        [508, 500],
        [500, 508],
        [508, 508],
        [516, 500],
        [500, 516],
        [516, 516],
        [524, 508],
    ];

    for (let ord = 0; ord < ATOM_INDICES.length; ord++) {
        const idx = ATOM_INDICES[ord];
        const [x, y] = basePos[ord];
        const id = BigInt(idx + 10_000);
        const role = atomRoleFor(ord);

        const logic = new Uint8Array(8);
        for (let b = 0; b < logic.length; b++) {
            logic[b] = (idx + b * 17) & 0xFF;
        }

        const resonance = role === STATE_MATRIX.ROLE_GUARDIAN ? 80 : 20;
        const energy = role === STATE_MATRIX.ROLE_PRODUCER ? 1200 : 400;
        STATE_MATRIX.seedAtom(idx, id, x, y, energy, resonance, logic);
        STATE_MATRIX.setRole(idx, role);
        STATE_MATRIX.setDamping(idx, 8 + ord);
    }

    // Cross-partition bonds to stress multi-worker interaction ordering.
    const pair = (a: number, b: number, slotA: number, slotB: number) => {
        STATE_MATRIX.setBondTarget(a, slotA, b);
        STATE_MATRIX.setBondStiffness(a, slotA, 0.9);
        STATE_MATRIX.setBondDistance(a, slotA, 60);

        STATE_MATRIX.setBondTarget(b, slotB, a);
        STATE_MATRIX.setBondStiffness(b, slotB, 0.85);
        STATE_MATRIX.setBondDistance(b, slotB, 60);
    };

    pair(100, 50_100, 0, 1);
    pair(1200, 51_200, 0, 1);
    pair(25_100, 75_100, 0, 1);
    pair(26_200, 76_200, 0, 1);
};

const buildSnapshot = (): Snapshot => {
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

    const atoms: AtomState[] = ATOM_INDICES.map((idx) => ({
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
    const workerCount = Number.parseInt(Deno.env.get("OMEGA_PULSE_WORKERS") ?? "4", 10);
    const strictDeterminism = (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1";
    seedScenario();
    await PULSE.initWorkers();
    for (let t = 0; t < TICKS; t++) {
        await PULSE.tick();
    }
    const snapshot = buildSnapshot();
    const hash = await hashHex(JSON.stringify(snapshot));
    return { workerCount, strictDeterminism, ticks: TICKS, hash, snapshot };
};

const runCaptureSubprocess = async (workerCount: number): Promise<CapturePayload> => {
    const cmd = new Deno.Command(Deno.execPath(), {
        args: ["run", "-A", "test_worker_determinism.ts", "--capture"],
        env: {
            ...Deno.env.toObject(),
            OMEGA_PULSE_WORKERS: String(workerCount),
            OMEGA_STRICT_DETERMINISM: "1",
        },
        stdout: "piped",
        stderr: "piped",
    });
    const res = await cmd.output();
    const out = new TextDecoder().decode(res.stdout);
    const err = new TextDecoder().decode(res.stderr);
    const merged = `${out}\n${err}`;

    if (res.code !== 0) {
        throw new Error(`[TEST] capture run failed (workers=${workerCount}).\n${merged}`);
    }

    const line = merged
        .split("\n")
        .map((s) => s.trim())
        .find((s) => s.startsWith(CAPTURE_MARKER));
    if (!line) {
        throw new Error(`[TEST] capture marker missing (workers=${workerCount}).\n${merged}`);
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

    console.log("🧪 [TEST] Worker determinism (1 vs 4 workers)...");
    const one = await runCaptureSubprocess(1);
    const four = await runCaptureSubprocess(4);

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
