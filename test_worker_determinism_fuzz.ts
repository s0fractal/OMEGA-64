const CAPTURE_MARKER = "__OMEGA_DETERMINISM_CAPTURE__";

type CapturePayload = {
    hash: string;
    seed: number;
    strictDeterminism: boolean;
    workerCount: number;
};

const runCapture = async (
    workerCount: number,
    strict: boolean,
    seed: number,
    ticks: number,
    atoms: number,
): Promise<CapturePayload> => {
    const cmd = new Deno.Command(Deno.execPath(), {
        args: ["run", "-A", "test_worker_determinism.ts", "--capture"],
        env: {
            ...Deno.env.toObject(),
            OMEGA_PULSE_WORKERS: String(workerCount),
            OMEGA_STRICT_DETERMINISM: strict ? "1" : "0",
            OMEGA_DETERMINISM_SEED: String(seed),
            OMEGA_DETERMINISM_TICKS: String(ticks),
            OMEGA_DETERMINISM_ATOMS: String(atoms),
        },
        stdout: "piped",
        stderr: "piped",
    });

    const res = await cmd.output();
    const out = new TextDecoder().decode(res.stdout);
    const err = new TextDecoder().decode(res.stderr);
    const merged = `${out}\n${err}`;

    if (res.code !== 0) {
        throw new Error(`[FUZZ] capture failed workers=${workerCount} strict=${strict} seed=${seed}\n${merged}`);
    }

    const line = merged
        .split("\n")
        .map((s) => s.trim())
        .find((s) => s.startsWith(CAPTURE_MARKER));
    if (!line) {
        throw new Error(`[FUZZ] capture marker missing workers=${workerCount} strict=${strict} seed=${seed}\n${merged}`);
    }

    return JSON.parse(line.slice(CAPTURE_MARKER.length)) as CapturePayload;
};

const makeSeeds = (count: number): number[] => {
    const out: number[] = [];
    let x = 0x9e3779b9;
    for (let i = 0; i < count; i++) {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        out.push((x >>> 0) || (i + 1));
    }
    return out;
};

async function main() {
    const cases = Number.parseInt(Deno.env.get("OMEGA_DETERMINISM_FUZZ_CASES") ?? "6", 10);
    const ticks = Number.parseInt(Deno.env.get("OMEGA_DETERMINISM_FUZZ_TICKS") ?? "20", 10);
    const atoms = Number.parseInt(Deno.env.get("OMEGA_DETERMINISM_FUZZ_ATOMS") ?? "20", 10);
    const seeds = makeSeeds(Math.max(1, Math.min(32, cases)));

    console.log(`🧪 [FUZZ] Worker determinism fuzz: cases=${seeds.length} ticks=${ticks} atoms=${atoms}`);

    let nonStrictFailures = 0;
    for (const seed of seeds) {
        const one = await runCapture(1, false, seed, ticks, atoms);
        const four = await runCapture(4, false, seed, ticks, atoms);
        const ok = one.hash === four.hash;
        console.log(`   [non-strict] seed=${seed} ${ok ? "OK" : "MISMATCH"} hash1=${one.hash.slice(0, 10)} hash4=${four.hash.slice(0, 10)}`);
        if (!ok) nonStrictFailures++;
    }

    // Strict spot checks (first and last seed) as a hard determinism gate.
    const strictSeeds = seeds.length === 1 ? [seeds[0]] : [seeds[0], seeds[seeds.length - 1]];
    let strictFailures = 0;
    for (const seed of strictSeeds) {
        const one = await runCapture(1, true, seed, ticks, atoms);
        const four = await runCapture(4, true, seed, ticks, atoms);
        const ok = one.hash === four.hash;
        console.log(`   [strict] seed=${seed} ${ok ? "OK" : "MISMATCH"} hash1=${one.hash.slice(0, 10)} hash4=${four.hash.slice(0, 10)}`);
        if (!ok) strictFailures++;
    }

    if (strictFailures > 0 || nonStrictFailures > 0) {
        throw new Error(`[FUZZ] determinism failures strict=${strictFailures} non-strict=${nonStrictFailures}`);
    }

    console.log("✅ [FUZZ] Worker determinism fuzz passed.");
}

main().catch((err) => {
    console.error(err);
    Deno.exit(1);
});
