import { PULSE } from "@02";
import { STATE_MATRIX } from "@00";
import * as OFFSETS from "@00";

const CAPTURE_MARKER = "__OMEGA_SPAWN_CAPTURE__";
const DEFAULT_SEED = 424242;
const DEFAULT_TICKS = 26;
const DEFAULT_REPLICATORS = 10;
const DEFAULT_ARCHITECTS = 6;

type CapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  seed: number;
  ticks: number;
  replicators: number;
  architects: number;
  hash: string;
  snapshot: Snapshot;
};

type Snapshot = {
  activeCount: number;
  tickCounter: number;
  spawnHeadWrite: number;
  spawnHeadRead: number;
  structureProbe: number[];
  signalProbe: number[];
  sample: AtomSample[];
};

type AtomSample = {
  idx: number;
  id: string;
  role: number;
  x: number;
  y: number;
  energy: number;
  resonance: number;
  pc: number;
};

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

const hashHex = async (payload: string): Promise<string> => {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

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
  script[pc++] = 1; // STRUCTURE.WIRE
  script[pc++] = 1; // state=1
  script[pc++] = STATE_MATRIX.RISC.OP_SIGNAL;
  script[pc++] = STATE_MATRIX.RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const seedScenario = (
  seed: number,
  replicators: number,
  architects: number,
): void => {
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
    STATE_MATRIX.seedAtom(
      idx,
      id,
      x,
      y,
      3200,
      260 + (i % 7),
      genome,
      repScript,
    );
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
    STATE_MATRIX.seedAtom(
      idx,
      id,
      x,
      y,
      2600,
      180 + (i % 5),
      genome,
      archScript,
    );
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_ARCHITECT);
  }
};

const gridProbe = (
  grid: Int32Array,
  x0: number,
  y0: number,
  w: number,
  h: number,
): number[] => {
  const out: number[] = [];
  for (let gy = y0; gy < y0 + h; gy++) {
    for (let gx = x0; gx < x0 + w; gx++) {
      out.push(grid[gy * 140 + gx]);
    }
  }
  return out;
};

const buildSnapshot = (): Snapshot => {
  const active = STATE_MATRIX.getActiveIndices();
  const sampleIdx = active.slice(0, 192);

  const structureGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_GRID_OFFSET,
    140 * 80,
  );
  const signalGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.SIGNAL_GRID_OFFSET,
    140 * 80,
  );
  const spawnHead = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.SPAWN_REQUESTS_OFFSET,
    2,
  );

  const sample: AtomSample[] = sampleIdx.map((idx) => ({
    idx,
    id: STATE_MATRIX.getId(idx).toString(),
    role: STATE_MATRIX.getRole(idx),
    x: STATE_MATRIX.getX(idx),
    y: STATE_MATRIX.getY(idx),
    energy: Number(STATE_MATRIX.getEnergy(idx).toFixed(3)),
    resonance: STATE_MATRIX.getResonance(idx),
    pc: STATE_MATRIX.getPC(idx),
  }));

  return {
    activeCount: active.length,
    tickCounter: Atomics.load(STATE_MATRIX.tickCounter, 0),
    spawnHeadWrite: Atomics.load(spawnHead, 0),
    spawnHeadRead: Atomics.load(spawnHead, 1),
    structureProbe: gridProbe(structureGrid, 30, 20, 20, 12),
    signalProbe: gridProbe(signalGrid, 30, 20, 20, 12),
    sample,
  };
};

const runCapture = async (): Promise<CapturePayload> => {
  const workerCount = parseEnvInt("OMEGA_PULSE_WORKERS", 4, 1, 32);
  const strictDeterminism =
    (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1";
  const seed = parseEnvInt(
    "OMEGA_SPAWN_DETERMINISM_SEED",
    DEFAULT_SEED,
    1,
    0x7fffffff,
  );
  const ticks = parseEnvInt(
    "OMEGA_SPAWN_DETERMINISM_TICKS",
    DEFAULT_TICKS,
    1,
    200,
  );
  const replicators = parseEnvInt(
    "OMEGA_SPAWN_DETERMINISM_REPLICATORS",
    DEFAULT_REPLICATORS,
    2,
    64,
  );
  const architects = parseEnvInt(
    "OMEGA_SPAWN_DETERMINISM_ARCHITECTS",
    DEFAULT_ARCHITECTS,
    1,
    32,
  );

  seedScenario(seed, replicators, architects);
  await PULSE.initWorkers();
  for (let t = 0; t < ticks; t++) {
    await PULSE.tick();
  }

  const snapshot = buildSnapshot();
  const hash = await hashHex(JSON.stringify(snapshot));
  return {
    workerCount,
    strictDeterminism,
    seed,
    ticks,
    replicators,
    architects,
    hash,
    snapshot,
  };
};

const runCaptureSubprocess = async (
  workerCount: number,
  strict: boolean,
  seed: number,
  ticks: number,
  replicators: number,
  architects: number,
): Promise<CapturePayload> => {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "02_metabolism/03_tests/test_spawn_determinism.ts", "--capture"],
    env: {
      ...Deno.env.toObject(),
      OMEGA_PULSE_WORKERS: String(workerCount),
      OMEGA_STRICT_DETERMINISM: strict ? "1" : "0",
      OMEGA_SPAWN_DETERMINISM_SEED: String(seed),
      OMEGA_SPAWN_DETERMINISM_TICKS: String(ticks),
      OMEGA_SPAWN_DETERMINISM_REPLICATORS: String(replicators),
      OMEGA_SPAWN_DETERMINISM_ARCHITECTS: String(architects),
    },
    stdout: "piped",
    stderr: "piped",
  });

  const res = await cmd.output();
  const out = new TextDecoder().decode(res.stdout);
  const err = new TextDecoder().decode(res.stderr);
  const merged = `${out}\n${err}`;

  if (res.code !== 0) {
    throw new Error(
      `[TEST] spawn capture failed (workers=${workerCount}, strict=${strict}).\n${merged}`,
    );
  }

  const line = merged
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.startsWith(CAPTURE_MARKER));
  if (!line) {
    throw new Error(
      `[TEST] spawn capture marker missing (workers=${workerCount}, strict=${strict}).\n${merged}`,
    );
  }

  return JSON.parse(line.slice(CAPTURE_MARKER.length)) as CapturePayload;
};

async function main() {
  if (Deno.args.includes("--capture")) {
    const capture = await runCapture();
    console.log(`${CAPTURE_MARKER}${JSON.stringify(capture)}`);
    Deno.exit(0);
  }

  const seed = parseEnvInt(
    "OMEGA_SPAWN_DETERMINISM_SEED",
    DEFAULT_SEED,
    1,
    0x7fffffff,
  );
  const ticks = parseEnvInt(
    "OMEGA_SPAWN_DETERMINISM_TICKS",
    DEFAULT_TICKS,
    1,
    200,
  );
  const replicators = parseEnvInt(
    "OMEGA_SPAWN_DETERMINISM_REPLICATORS",
    DEFAULT_REPLICATORS,
    2,
    64,
  );
  const architects = parseEnvInt(
    "OMEGA_SPAWN_DETERMINISM_ARCHITECTS",
    DEFAULT_ARCHITECTS,
    1,
    32,
  );

  console.log(
    `🧪 [TEST] Spawn determinism (strict 1 vs 4 workers) seed=${seed} ticks=${ticks} reps=${replicators} arch=${architects}`,
  );
  const one = await runCaptureSubprocess(
    1,
    true,
    seed,
    ticks,
    replicators,
    architects,
  );
  const four = await runCaptureSubprocess(
    4,
    true,
    seed,
    ticks,
    replicators,
    architects,
  );

  console.log(`   workers=1 strict=${one.strictDeterminism} hash=${one.hash}`);
  console.log(
    `   workers=4 strict=${four.strictDeterminism} hash=${four.hash}`,
  );

  if (one.hash !== four.hash) {
    console.error(
      "❌ [TEST] Spawn determinism mismatch between worker topologies.",
    );
    console.error(
      `   activeCount: ${one.snapshot.activeCount} vs ${four.snapshot.activeCount}`,
    );
    console.error(
      `   tickCounter: ${one.snapshot.tickCounter} vs ${four.snapshot.tickCounter}`,
    );
    throw new Error("[TEST] spawn determinism failed.");
  }

  console.log("✅ [TEST] Spawn determinism verified.");
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
