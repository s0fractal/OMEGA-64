import { GRID_W, GRID_H, GRID_CELLS } from "@generated";
import { PULSE } from "@generated";
import { MX } from "@generated";
import { SIGNAL_GRID_OFFSET, STRUCTURE_GRID_OFFSET } from "@generated";
import {
  type DeterminismAtomState,
  type DeterminismCapturePayload,
  type DeterminismSnapshot,
  emitDeterminismCapture,
  runDeterminismCaptureSubprocess,
} from "@02/03/worker_determinism_capture.ts";

const DEFAULT_TICKS = 24;
const DEFAULT_SEED = 1337;
const DEFAULT_ATOMS = 16;

type CapturePayload = DeterminismCapturePayload;
type Snapshot = DeterminismSnapshot;
type AtomState = DeterminismAtomState;

const parseEnvInt = (
  name: string,
  fallback: number,
  min: number,
  max: number,
): number => {
  const raw = Deno.env.get(name);
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};

const makePrng = (seed: number): () => number => {
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
    MX.ROLE_PRODUCER,
    MX.ROLE_NEUTRAL,
    MX.ROLE_GUARDIAN,
    MX.ROLE_PARASITE,
  ];
  return roles[(ord + (next() & 3)) & 3];
};

const buildAtomIndices = (count: number): number[] => {
  const out: number[] = [];
  const perBand = Math.ceil(count / 4);
  for (let band = 0; band < 4 && out.length < count; band++) {
    const base = band * 2500 + 100;
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
  MX.clear();
  Atomics.store(MX.syncState, 0, MX.SYNC.IDLE);
  Atomics.store(MX.tickCounter, 0, 1);

  const next = makePrng(seed);
  const indices = buildAtomIndices(atomCount);

  for (let ord = 0; ord < indices.length; ord++) {
    const idx = indices[ord];
    const role = roleAt(ord, next);
    const x = randInt(next, 280, 1120);
    const y = randInt(next, 140, 680);
    const resonance = role === MX.ROLE_GUARDIAN
      ? randInt(next, 80, 220)
      : randInt(next, 10, 120);
    const energy = role === MX.ROLE_PRODUCER
      ? randInt(next, 900, 1600)
      : randInt(next, 250, 900);
    const id = (BigInt(seed >>> 0) << 32n) ^ BigInt(idx + 1);

    const logic = new Uint8Array(8);
    for (let b = 0; b < logic.length; b++) {
      logic[b] = randInt(next, 0, 255);
    }

    MX.seedAtom(idx, id, x, y, energy, resonance, logic);
    MX.setRole(idx, role);
    MX.setDamping(idx, randInt(next, 0, 30));
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

    MX.setBondTarget(a, slotA, b);
    MX.setBondStiffness(a, slotA, stiffness);
    MX.setBondDistance(a, slotA, dist);

    MX.setBondTarget(b, slotB, a);
    MX.setBondStiffness(b, slotB, stiffness);
    MX.setBondDistance(b, slotB, dist);
  }

  return indices;
};

const buildSnapshot = (indices: number[]): Snapshot => {
  const structureGrid = new Int32Array(
    MX.buffer,
    STRUCTURE_GRID_OFFSET,
    GRID_CELLS,
  );
  const signalGrid = new Int32Array(
    MX.buffer,
    SIGNAL_GRID_OFFSET,
    GRID_CELLS,
  );

  const slice = (grid: Int32Array): number[] => {
    const out: number[] = [];
    for (let gy = 45; gy <= 60; gy++) {
      for (let gx = 45; gx <= 60; gx++) {
        out.push(grid[gy * GRID_W + gx]);
      }
    }
    return out;
  };

  const atoms: AtomState[] = indices.map((idx) => ({
    idx,
    id: MX.getId(idx).toString(),
    role: MX.getRole(idx),
    x: MX.getX(idx),
    y: MX.getY(idx),
    energy: Number(MX.getEnergy(idx).toFixed(3)),
    resonance: MX.getResonance(idx),
    phase: MX.getPhase(idx),
    pc: MX.getPC(idx),
    logic: Array.from(MX.getLogic(idx)),
    bonds: Array.from(MX.getBonds(idx)),
    bondDistances: [0, 1, 2, 3].map((slot) =>
      MX.getBondDistance(idx, slot)
    ),
    damping: MX.getDamping(idx),
  }));

  return {
    activeCount: MX.getActiveIndices().length,
    tickCounter: Atomics.load(MX.tickCounter, 0),
    atoms,
    structureSlice: slice(structureGrid),
    signalSlice: slice(signalGrid),
  };
};

const runCapture = async (): Promise<CapturePayload> => {
  const workerCount = parseEnvInt("OMEGA_PULSE_WORKERS", 4, 1, 32);
  const strictDeterminism =
    (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1";
  const seed = parseEnvInt(
    "OMEGA_DETERMINISM_SEED",
    DEFAULT_SEED,
    1,
    0x7fffffff,
  );
  const ticks = parseEnvInt("OMEGA_DETERMINISM_TICKS", DEFAULT_TICKS, 1, 200);
  const atomCount = parseEnvInt(
    "OMEGA_DETERMINISM_ATOMS",
    DEFAULT_ATOMS,
    4,
    128,
  );

  const indices = seedScenario(seed, atomCount);
  await PULSE.initWorkers();
  for (let t = 0; t < ticks; t++) {
    await PULSE.tick();
  }

  const snapshot = buildSnapshot(indices);
  const hash = await hashHex(JSON.stringify(snapshot));
  return {
    workerCount,
    strictDeterminism,
    seed,
    ticks,
    atomCount,
    hash,
    snapshot,
  };
};

const runCaptureSubprocess = async (
  workerCount: number,
  strict: boolean,
  seed: number,
  ticks: number,
  atomCount: number,
): Promise<CapturePayload> => {
  return await runDeterminismCaptureSubprocess({
    workerCount,
    strict,
    seed,
    ticks,
    atomCount,
    context: "TEST",
  });
};

const compareAtoms = (a: AtomState[], b: AtomState[]): string[] => {
  const diffs: string[] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const aa = a[i];
    const bb = b[i];
    if (JSON.stringify(aa) !== JSON.stringify(bb)) {
      diffs.push(
        `idx=${aa.idx} worker1=${JSON.stringify(aa)} worker4=${
          JSON.stringify(bb)
        }`,
      );
    }
    if (diffs.length >= 8) break;
  }
  return diffs;
};

async function main() {
  if (Deno.args.includes("--capture")) {
    const capture = await runCapture();
    emitDeterminismCapture(capture);
    Deno.exit(0);
  }

  const seed = parseEnvInt(
    "OMEGA_DETERMINISM_SEED",
    DEFAULT_SEED,
    1,
    0x7fffffff,
  );
  const ticks = parseEnvInt("OMEGA_DETERMINISM_TICKS", DEFAULT_TICKS, 1, 200);
  const atomCount = parseEnvInt(
    "OMEGA_DETERMINISM_ATOMS",
    DEFAULT_ATOMS,
    4,
    128,
  );

  console.log(
    `🧪 [TEST] Worker determinism (1 vs 4 workers) seed=${seed} ticks=${ticks} atoms=${atomCount}`,
  );
  const one = await runCaptureSubprocess(1, true, seed, ticks, atomCount);
  const four = await runCaptureSubprocess(4, true, seed, ticks, atomCount);

  console.log(`   workers=1 strict=${one.strictDeterminism} hash=${one.hash}`);
  console.log(
    `   workers=4 strict=${four.strictDeterminism} hash=${four.hash}`,
  );

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
