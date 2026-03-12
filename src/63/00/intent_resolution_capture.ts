import { RISC, STATE_MATRIX, STRUCTURE } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_INTENT_RESOLUTION_CAPTURE__";
const GRID_W = 140;

type RoleSnapshot = {
  originalRole: number;
  finalRole: number;
  resonance: number;
  neighbors: number;
};

type BankSnapshot = {
  originalEnergy: number;
  finalEnergy: number;
  poolBalance: number;
  resonance: number;
};

type Snapshot = {
  role: RoleSnapshot;
  bank: BankSnapshot;
};

type CapturePayload = {
  hash: string;
  snapshot: Snapshot;
};

const hashHex = async (payload: string): Promise<string> => {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
};

const syncPhysicsBuffers = (): void => {
  const buf = STATE_MATRIX.buffer;
  new Int16Array(buf, OFFSETS.PHYSICS_READ_XS_OFFSET, 100000).set(
    new Int16Array(buf, OFFSETS.XS_OFFSET, 100000),
  );
  new Int16Array(buf, OFFSETS.PHYSICS_READ_YS_OFFSET, 100000).set(
    new Int16Array(buf, OFFSETS.YS_OFFSET, 100000),
  );
  new Int32Array(buf, OFFSETS.PHYSICS_READ_ENERGY_OFFSET, 100000).set(
    new Int32Array(buf, OFFSETS.ENERGY_OFFSET, 100000),
  );
  new Int32Array(buf, OFFSETS.PHYSICS_READ_RESONANCE_OFFSET, 100000).set(
    new Int32Array(buf, OFFSETS.RESONANCE_OFFSET, 100000),
  );
};

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const wasmBytes = await Deno.readFile("src/00/release.wasm");
  const trace_atom = (
    idx: number,
    op: number,
    p1: number,
    p2: number,
    p3: number,
  ) => {
    console.log(
      `[KERNEL_TRACE] idx=${idx} op=0x${
        op.toString(16)
      } p1=${p1} p2=${p2} p3=${p3}`,
    );
  };
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom },
    env: {
      memory: STATE_MATRIX.wasmMemory,
      trace_atom,
      abort: () => {},
    },
  });

  const execute_atom = instance.exports.execute_atom as (idx: number) => void;
  const reduce_atom_deltas = instance.exports.reduce_atom_deltas as (
    start: number,
    end: number,
  ) => void;

  // --- PART 1: ROLE RESOLUTION ---
  const rx = 50, ry = 50;
  const gx = Math.floor(rx / 10);
  const gy = Math.floor(ry / 10);

  // Script: SET R0, ROLE_GUARDIAN; RESOLVE mode=0 (Role), threshold=2
  const roleScript = Uint8Array.of(
    RISC.OP_SET,
    0,
    STATE_MATRIX.ROLE_GUARDIAN,
    RISC.OP_RESOLVE,
    0,
    2,
    RISC.OP_NOP,
  );

  STATE_MATRIX.seedAtom(0, 101n, rx, ry, 1000, 100, undefined, roleScript);

  // Neighbors
  STATE_MATRIX.setGridType(gy * GRID_W + (gx - 1), STRUCTURE.WIRE);
  STATE_MATRIX.setGridType(gy * GRID_W + (gx + 1), STRUCTURE.WIRE);

  syncPhysicsBuffers();
  execute_atom(0);
  reduce_atom_deltas(0, 1);

  const roleSnap: RoleSnapshot = {
    originalRole: STATE_MATRIX.ROLE_NEUTRAL,
    finalRole: STATE_MATRIX.getRole(0),
    resonance: STATE_MATRIX.getResonance(0),
    neighbors: 2,
  };

  // --- PART 2: ENERGY BANKING ---
  STATE_MATRIX.clear();

  const bx = 100, by = 100;
  const bgx = Math.floor(bx / 10);
  const bgy = Math.floor(by / 10);

  // Script: RESOLVE mode=1 (Bank), amount=100
  const bankScript = Uint8Array.of(
    RISC.OP_RESOLVE,
    1,
    100,
    RISC.OP_NOP,
  );

  STATE_MATRIX.seedAtom(0, 202n, bx, by, 1000, 100, undefined, bankScript);
  // Set regs[8] (gene0) to control pool slot
  const instructions = new Uint8Array(
    STATE_MATRIX.buffer,
    OFFSETS.INSTRUCTIONS_OFFSET,
    100000 * 64,
  );
  const instr_ptr = 0 * 64; // atom 0
  // [OP_RESOLVE, 1, 100], [OP_SPORE_DRIVE], [OP_NOP]
  instructions[instr_ptr + 0] = 0xAC; // OP_RESOLVE
  instructions[instr_ptr + 1] = 1; // mode 1
  instructions[instr_ptr + 2] = 100; // value 100
  instructions[instr_ptr + 3] = 0xAA; // OP_SPORE_DRIVE
  instructions[instr_ptr + 4] = 0x00; // OP_NOP

  const context = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.CONTEXT_OFFSET,
    100000 * 16,
  );
  context[0 * 16 + 8] = 0; // FORCE PC = 0 (byte offset 32 in ASM)
  context[0 * 16 + 9] = 0x12; // slot = 0x12 % 4 = 2 (byte offset 36 in ASM)

  // 4 Neighbors for banking quorum (need >= 3)
  STATE_MATRIX.setGridType(bgy * GRID_W + (bgx - 1), STRUCTURE.WIRE);
  STATE_MATRIX.setGridType(bgy * GRID_W + (bgx + 1), STRUCTURE.WIRE);
  STATE_MATRIX.setGridType((bgy - 1) * GRID_W + bgx, STRUCTURE.WIRE);
  STATE_MATRIX.setGridType((bgy + 1) * GRID_W + bgx, STRUCTURE.WIRE);

  syncPhysicsBuffers();
  // Run for more steps
  for (let i = 0; i < 64; i++) {
    const ctxIdx = 0 * 16;
    context[ctxIdx + 8] = 0; // RE-FORCE PC = 0 (byte 32)
    execute_atom(0);
  }
  reduce_atom_deltas(0, 1);

  const poolView = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.HIVE_ENERGY_POOL_OFFSET,
    256,
  );
  let totalPool = 0;
  for (let i = 0; i < 256; i++) {
    if (poolView[i] > 0) totalPool += poolView[i];
  }

  const bankSnap: BankSnapshot = {
    originalEnergy: 1000,
    finalEnergy: STATE_MATRIX.getEnergy(0),
    poolBalance: totalPool,
    resonance: STATE_MATRIX.getResonance(0),
  };

  const snapshot: Snapshot = { role: roleSnap, bank: bankSnap };
  const hash = await hashHex(JSON.stringify(snapshot));

  return { hash, snapshot };
};

const main = async () => {
  const payload = await runCapture();
  if (Deno.args.includes("--capture")) {
    console.log(`${CAPTURE_MARKER}${JSON.stringify(payload)}`);
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
};

await main();
