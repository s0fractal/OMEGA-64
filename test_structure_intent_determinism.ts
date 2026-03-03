import { PULSE } from "./PULSE.ts";
import { STATE_MATRIX, STRUCTURE } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_STRUCTURE_INTENT_CAPTURE__";
const GRID_W = 140;
const GRID_H = 80;
const DEFAULT_SEED = 404;
const DEFAULT_TICKS = 18;
const DEFAULT_ATOMS = 20;

const OP_SET = 0x01;
const OP_JMP = 0x12;
const OP_PLUG = 0xA4;
const OP_BUILD = 0xA8;
const OP_SIGNAL = 0x81;

type AtomState = {
    idx: number;
    energy: number;
    resonance: number;
    pc: number;
    role: number;
};

type Snapshot = {
    tickCounter: number;
    centerCell: number;
    centerX: number;
    centerY: number;
    neighborhood: number[];
    atoms: AtomState[];
};

type CapturePayload = {
    workerCount: number;
    strictDeterminism: boolean;
    seed: number;
    ticks: number;
    atomCount: number;
    hash: string;
    snapshot: Snapshot;
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

const hashHex = async (payload: string): Promise<string> => {
    const bytes = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

const buildAtomIndices = (count: number): number[] => {
    const out: number[] = [];
    const perBand = Math.ceil(count / 4);
    for (let band = 0; band < 4 && out.length < count; band++) {
        const base = band * 25_000 + 200;
        for (let k = 0; k < perBand && out.length < count; k++) {
            out.push(base + k * 131);
        }
    }
    return out;
};

const buildConflictScript = (charge: number, type: number, state: number): Uint8Array => {
    const script = new Uint8Array(64);
    let pc = 0;

    script[pc++] = OP_SET; script[pc++] = 0; script[pc++] = charge & 0xFF;
    script[pc++] = OP_PLUG; script[pc++] = 1; script[pc++] = 0;
    script[pc++] = OP_BUILD; script[pc++] = type & 0xFF; script[pc++] = state & 0xFF;
    script[pc++] = OP_SIGNAL;
    script[pc++] = OP_JMP; script[pc++] = 0;

    return script;
};

const seedConflictScenario = (seed: number, atomCount: number): { indices: number[]; centerCellIdx: number; centerX: number; centerY: number } => {
    STATE_MATRIX.clear();
    Atomics.store(STATE_MATRIX.syncState, 0, STATE_MATRIX.SYNC.IDLE);
    Atomics.store(STATE_MATRIX.tickCounter, 0, 1);

    const next = makePrng(seed);
    const indices = buildAtomIndices(atomCount);
    const structureGrid = new Int32Array(STATE_MATRIX.buffer, OFFSETS.STRUCTURE_GRID_OFFSET, GRID_W * GRID_H);
    const centerGX = 70;
    const centerGY = 40;
    const centerCellIdx = centerGY * GRID_W + centerGX;
    const centerX = centerGX * 10 + 5;
    const centerY = centerGY * 10 + 5;

    structureGrid.fill(0);
    structureGrid[centerCellIdx] = STRUCTURE.WIRE | (40 << 16);

    for (let ord = 0; ord < indices.length; ord++) {
        const idx = indices[ord];
        const charge = 20 + (next() % 180);
        const type = 1 + (next() % 6);
        const state = ord & 0xFF;
        const script = buildConflictScript(charge, type, state);
        const logic = new Uint8Array(8);
        for (let b = 0; b < logic.length; b++) logic[b] = next() & 0xFF;

        const id = (BigInt(seed >>> 0) << 32n) ^ BigInt(idx + 1);
        STATE_MATRIX.seedAtom(idx, id, centerX, centerY, 3000, 1, logic, script);
        STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_ARCHITECT);
        STATE_MATRIX.setDamping(idx, 0);
    }

    return { indices, centerCellIdx, centerX, centerY };
};

const buildSnapshot = (indices: number[], centerCellIdx: number, centerX: number, centerY: number): Snapshot => {
    const structureGrid = new Int32Array(STATE_MATRIX.buffer, OFFSETS.STRUCTURE_GRID_OFFSET, GRID_W * GRID_H);
    const centerGX = Math.floor(centerX / 10);
    const centerGY = Math.floor(centerY / 10);
    const neighborhood: number[] = [];

    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            const gx = centerGX + dx;
            const gy = centerGY + dy;
            if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) {
                neighborhood.push(0);
            } else {
                neighborhood.push(structureGrid[gy * GRID_W + gx]);
            }
        }
    }

    const atoms: AtomState[] = indices.map((idx) => ({
        idx,
        energy: Number(STATE_MATRIX.getEnergy(idx).toFixed(3)),
        resonance: STATE_MATRIX.getResonance(idx),
        pc: STATE_MATRIX.getPC(idx),
        role: STATE_MATRIX.getRole(idx),
    }));

    return {
        tickCounter: Atomics.load(STATE_MATRIX.tickCounter, 0),
        centerCell: structureGrid[centerCellIdx],
        centerX,
        centerY,
        neighborhood,
        atoms,
    };
};

const runCapture = async (): Promise<CapturePayload> => {
    const workerCount = parseEnvInt("OMEGA_PULSE_WORKERS", 4, 1, 32);
    const strictDeterminism = (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1";
    const seed = parseEnvInt("OMEGA_STRUCTURE_INTENT_SEED", DEFAULT_SEED, 1, 0x7fffffff);
    const ticks = parseEnvInt("OMEGA_STRUCTURE_INTENT_TICKS", DEFAULT_TICKS, 1, 128);
    const atomCount = parseEnvInt("OMEGA_STRUCTURE_INTENT_ATOMS", DEFAULT_ATOMS, 8, 96);

    const { indices, centerCellIdx, centerX, centerY } = seedConflictScenario(seed, atomCount);
    await PULSE.initWorkers();
    for (let t = 0; t < ticks; t++) {
        await PULSE.tick();
    }

    const snapshot = buildSnapshot(indices, centerCellIdx, centerX, centerY);
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
        args: ["run", "-A", "test_structure_intent_determinism.ts", "--capture"],
        env: {
            ...Deno.env.toObject(),
            OMEGA_PULSE_WORKERS: String(workerCount),
            OMEGA_STRICT_DETERMINISM: strict ? "1" : "0",
            OMEGA_STRUCTURE_INTENT_SEED: String(seed),
            OMEGA_STRUCTURE_INTENT_TICKS: String(ticks),
            OMEGA_STRUCTURE_INTENT_ATOMS: String(atomCount),
        },
        stdout: "piped",
        stderr: "piped",
    });

    const res = await cmd.output();
    const out = new TextDecoder().decode(res.stdout);
    const err = new TextDecoder().decode(res.stderr);
    const merged = `${out}\n${err}`;
    if (res.code !== 0) {
        throw new Error(`[TEST] structure-intent capture failed (workers=${workerCount}, strict=${strict}).\n${merged}`);
    }

    const line = merged
        .split("\n")
        .map((s) => s.trim())
        .find((s) => s.startsWith(CAPTURE_MARKER));
    if (!line) {
        throw new Error(`[TEST] structure-intent capture marker missing (workers=${workerCount}, strict=${strict}).\n${merged}`);
    }
    return JSON.parse(line.slice(CAPTURE_MARKER.length)) as CapturePayload;
};

const cellType = (cell: number): number => cell & 0xFF;
const cellCharge = (cell: number): number => (cell >> 16) & 0xFF;
const cellState = (cell: number): number => (cell >> 24) & 0xFF;

async function main() {
    if (Deno.args.includes("--capture")) {
        const payload = await runCapture();
        console.log(`${CAPTURE_MARKER}${JSON.stringify(payload)}`);
        Deno.exit(0);
    }

    const seed = parseEnvInt("OMEGA_STRUCTURE_INTENT_SEED", DEFAULT_SEED, 1, 0x7fffffff);
    const ticks = parseEnvInt("OMEGA_STRUCTURE_INTENT_TICKS", DEFAULT_TICKS, 1, 128);
    const atomCount = parseEnvInt("OMEGA_STRUCTURE_INTENT_ATOMS", DEFAULT_ATOMS, 8, 96);

    console.log(`🧪 [TEST] Structure intent determinism | seed=${seed} ticks=${ticks} atoms=${atomCount}`);

    const one = await runCaptureSubprocess(1, false, seed, ticks, atomCount);
    const four = await runCaptureSubprocess(4, false, seed, ticks, atomCount);
    if (one.hash !== four.hash) {
        const a = one.snapshot.centerCell;
        const b = four.snapshot.centerCell;
        throw new Error(
            [
                "[TEST] Non-strict structure intent mismatch.",
                `hash(1w)=${one.hash}`,
                `hash(4w)=${four.hash}`,
                `center(1w)=type:${cellType(a)} state:${cellState(a)} charge:${cellCharge(a)}`,
                `center(4w)=type:${cellType(b)} state:${cellState(b)} charge:${cellCharge(b)}`,
            ].join("\n"),
        );
    }

    const oneStrict = await runCaptureSubprocess(1, true, seed, ticks, atomCount);
    const fourStrict = await runCaptureSubprocess(4, true, seed, ticks, atomCount);
    if (oneStrict.hash !== fourStrict.hash) {
        throw new Error(
            [
                "[TEST] Strict structure intent mismatch.",
                `hash(1w)=${oneStrict.hash}`,
                `hash(4w)=${fourStrict.hash}`,
            ].join("\n"),
        );
    }

    console.log(`✅ [TEST] Structure intent determinism verified. hash=${one.hash.slice(0, 12)}`);
}

main().catch((err) => {
    console.error(err);
    Deno.exit(1);
});
