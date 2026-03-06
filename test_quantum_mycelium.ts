import { STATE_MATRIX, STRUCTURE } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";

type WasmExports = {
  execute_atom: (idx: number) => void;
};

const SCALE = 1000;

const fail = (message: string): never => {
  console.error(`❌ [TEST] ${message}`);
  Deno.exit(1);
};

const assertEq = (actual: number, expected: number, label: string) => {
  if (actual !== expected) {
    fail(`${label}: expected=${expected}, actual=${actual}`);
  }
};

const rawEnergy = (atomIdx: number): number =>
  Math.round(STATE_MATRIX.getEnergy(atomIdx) * SCALE);

const readXs = new Int16Array(
  STATE_MATRIX.buffer,
  OFFSETS.PHYSICS_READ_XS_OFFSET,
  STATE_MATRIX.MAX_ATOMS,
);
const readYs = new Int16Array(
  STATE_MATRIX.buffer,
  OFFSETS.PHYSICS_READ_YS_OFFSET,
  STATE_MATRIX.MAX_ATOMS,
);
const readEnergyBuffer = new Int32Array(
  STATE_MATRIX.buffer,
  OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
  STATE_MATRIX.MAX_ATOMS,
);
const readResonanceBuffer = new Int32Array(
  STATE_MATRIX.buffer,
  OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
  STATE_MATRIX.MAX_ATOMS,
);

const syncReadSnapshot = (atomIdx: number) => {
  Atomics.store(readXs, atomIdx, STATE_MATRIX.getX(atomIdx));
  Atomics.store(readYs, atomIdx, STATE_MATRIX.getY(atomIdx));
  Atomics.store(readEnergyBuffer, atomIdx, rawEnergy(atomIdx));
  Atomics.store(
    readResonanceBuffer,
    atomIdx,
    STATE_MATRIX.getResonance(atomIdx),
  );
};

const lcgNext = (seed: number): number =>
  (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;

const computeSporeTarget = (
  id: bigint,
  tick: number,
  phase: number,
  logic0: number,
  logic1: number,
) => {
  const idLo = Number(id & 0xFFFF_FFFFn) >>> 0;
  const idHi = Number((id >> 32n) & 0xFFFF_FFFFn) >>> 0;
  const genomeHead = (((logic0 & 0xFF) << 8) | (logic1 & 0xFF)) >>> 0;
  let seed = (idLo ^ ((idHi << 1) >>> 0) ^
    Math.imul(tick >>> 0, 2246822519) ^
    Math.imul(phase >>> 0, 3266489917) ^
    genomeHead) >>>
    0;
  seed = lcgNext(seed);
  const x = seed % 1400;
  seed = lcgNext(seed ^ ((genomeHead << 16) >>> 0));
  const y = seed % 800;
  return { x, y, gx: Math.floor(x / 10), gy: Math.floor(y / 10) };
};

const genomePoolSlot = (logic: Uint8Array): number => {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < 8; i++) {
    hash = Math.imul((hash ^ logic[i]) >>> 0, 16777619) >>> 0;
  }
  return hash & 255;
};

const instantiate = async (): Promise<WasmExports> => {
  const wasmCode = await Deno.readFile("./build/release.wasm");
  const trace_atom = () => {};
  const wasmModule = await WebAssembly.instantiate(wasmCode, {
    index: {
      trace_atom,
    },
    env: {
      memory: STATE_MATRIX.wasmMemory,
      trace_atom,
      abort: () => {},
    },
  });
  return wasmModule.instance.exports as unknown as WasmExports;
};

const runSporeDrivePass = (wasm: WasmExports) => {
  const atom = 3;
  const id = 8n; // keep <=10 to skip physics side effects
  const phase = 17;
  const logic = new Uint8Array([0x11, 0x22, 0, 0, 0, 0, 0, 0]);
  const tick = 777;

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.tickCounter, 0, tick);
  STATE_MATRIX.setId(atom, id);
  STATE_MATRIX.setX(atom, 100);
  STATE_MATRIX.setY(atom, 120);
  STATE_MATRIX.setPhase(atom, phase);
  STATE_MATRIX.setLogic(atom, logic);
  STATE_MATRIX.setEnergy(atom, 2); // raw=2000
  const script = new Uint8Array(64);
  script[0] = STATE_MATRIX.RISC.OP_SPORE_DRIVE;
  STATE_MATRIX.setInstructions(atom, script);
  STATE_MATRIX.setPC(atom, 0);

  const target = computeSporeTarget(id, tick, phase, logic[0], logic[1]);
  syncReadSnapshot(atom);
  wasm.execute_atom(atom);

  assertEq(STATE_MATRIX.getX(atom), target.x, "spore-drive success X");
  assertEq(STATE_MATRIX.getY(atom), target.y, "spore-drive success Y");
  assertEq(rawEnergy(atom), 1499, "spore-drive success energy(raw)");
};

const runSporeDriveBlocked = (wasm: WasmExports) => {
  const atom = 4;
  const id = 9n; // keep <=10 to skip physics side effects
  const phase = 9;
  const logic = new Uint8Array([0xCA, 0xFE, 0, 0, 0, 0, 0, 0]);
  const tick = 778;
  const startX = 300;
  const startY = 310;

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.tickCounter, 0, tick);
  STATE_MATRIX.setId(atom, id);
  STATE_MATRIX.setX(atom, startX);
  STATE_MATRIX.setY(atom, startY);
  STATE_MATRIX.setPhase(atom, phase);
  STATE_MATRIX.setLogic(atom, logic);
  STATE_MATRIX.setEnergy(atom, 2); // raw=2000
  const script = new Uint8Array(64);
  script[0] = STATE_MATRIX.RISC.OP_SPORE_DRIVE;
  STATE_MATRIX.setInstructions(atom, script);
  STATE_MATRIX.setPC(atom, 0);

  const target = computeSporeTarget(id, tick, phase, logic[0], logic[1]);
  const cellIdx = target.gy * 140 + target.gx;
  Atomics.store(
    STATE_MATRIX.structureGrid,
    cellIdx,
    STRUCTURE.WIRE,
  );

  syncReadSnapshot(atom);
  wasm.execute_atom(atom);

  assertEq(STATE_MATRIX.getX(atom), startX, "spore-drive blocked X");
  assertEq(STATE_MATRIX.getY(atom), startY, "spore-drive blocked Y");
  assertEq(rawEnergy(atom), 1499, "spore-drive blocked energy(raw)");
};

const runEntangleDeposit = (wasm: WasmExports) => {
  const atom = 5;
  const logic = new Uint8Array([1, 3, 3, 7, 9, 1, 4, 2]);
  const slot = genomePoolSlot(logic);

  STATE_MATRIX.clear();
  STATE_MATRIX.setId(atom, 7n); // keep <=10 to skip physics side effects
  STATE_MATRIX.setLogic(atom, logic);
  STATE_MATRIX.setEnergy(atom, 1.2); // raw=1200
  STATE_MATRIX.setHiveEnergyPoolSlot(slot, 0);
  const script = new Uint8Array(64);
  script[0] = STATE_MATRIX.RISC.OP_ENTANGLE;
  STATE_MATRIX.setInstructions(atom, script);
  STATE_MATRIX.setPC(atom, 0);

  syncReadSnapshot(atom);
  wasm.execute_atom(atom);

  assertEq(
    STATE_MATRIX.getHiveEnergyPoolSlot(slot),
    120,
    "entangle deposit pool slot",
  );
  assertEq(rawEnergy(atom), 1079, "entangle deposit energy(raw)");
};

const runEntangleWithdraw = (wasm: WasmExports) => {
  const atom = 6;
  const logic = new Uint8Array([1, 3, 3, 7, 9, 1, 4, 2]);
  const slot = genomePoolSlot(logic);

  STATE_MATRIX.clear();
  STATE_MATRIX.setId(atom, 6n); // keep <=10 to skip physics side effects
  STATE_MATRIX.setLogic(atom, logic);
  STATE_MATRIX.setEnergy(atom, 0.2); // raw=200
  STATE_MATRIX.setHiveEnergyPoolSlot(slot, 150);
  const script = new Uint8Array(64);
  script[0] = STATE_MATRIX.RISC.OP_ENTANGLE;
  STATE_MATRIX.setInstructions(atom, script);
  STATE_MATRIX.setPC(atom, 0);

  syncReadSnapshot(atom);
  wasm.execute_atom(atom);

  assertEq(
    STATE_MATRIX.getHiveEnergyPoolSlot(slot),
    0,
    "entangle withdraw pool",
  );
  assertEq(rawEnergy(atom), 349, "entangle withdraw energy(raw)");
};

async function run() {
  console.log("🧪 [TEST] Quantum Mycelium ISA (SPORE_DRIVE + ENTANGLE)");
  const wasm = await instantiate();
  runSporeDrivePass(wasm);
  runSporeDriveBlocked(wasm);
  runEntangleDeposit(wasm);
  runEntangleWithdraw(wasm);
  console.log("✅ [TEST] Quantum Mycelium ISA is coherent.");
}

if (import.meta.main) {
  await run();
}
