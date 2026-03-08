import { STATE_MATRIX, RISC } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_QUORUM_SYNC_CAPTURE__";
const GRID_W = 140;

type QuorumSnapshot = {
  sourcePc: number;
  peer1Pc: number;
  peer2Pc: number;
  outsiderPc: number;
};

type ShareSnapshot = {
  sourceEnergy: number;
  targetEnergy: number;
  hormoneAggression: number;
};

type Snapshot = {
  quorum: QuorumSnapshot;
  share: ShareSnapshot;
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

const setSpatialCell = (cellIdx: number, atoms: number[]): void => {
  const spatialGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.SPATIAL_GRID_OFFSET,
    140 * 80 * 32,
  );
  const base = cellIdx * 32;
  spatialGrid.fill(0, base, base + 32);
  spatialGrid[base] = atoms.length;
  for (let i = 0; i < atoms.length && i < 31; i++) {
    spatialGrid[base + 1 + i] = atoms[i]!;
  }
};

const syncPhysicsBuffers = (): void => {
  const buf = STATE_MATRIX.buffer;
  // XS to READ_XS
  new Int16Array(buf, OFFSETS.PHYSICS_READ_XS_OFFSET, 100000).set(
    new Int16Array(buf, OFFSETS.XS_OFFSET, 100000)
  );
  // YS to READ_YS
  new Int16Array(buf, OFFSETS.PHYSICS_READ_YS_OFFSET, 100000).set(
    new Int16Array(buf, OFFSETS.YS_OFFSET, 100000)
  );
  // ENERGY to READ_ENERGY
  new Int32Array(buf, OFFSETS.PHYSICS_READ_ENERGY_OFFSET, 100000).set(
    new Int32Array(buf, OFFSETS.ENERGY_OFFSET, 100000)
  );
  // RESONANCE to READ_RESONANCE
  new Int32Array(buf, OFFSETS.PHYSICS_READ_RESONANCE_OFFSET, 100000).set(
    new Int32Array(buf, OFFSETS.RESONANCE_OFFSET, 100000)
  );
};

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const wasmBytes = await Deno.readFile("./build/release.wasm");
  const trace_atom = (idx: number, op: number, res: number, tick: number, role: number) => {
    console.error(`[KERNEL_TRACE] idx=${idx} op=0x${op.toString(16)} res=${res} tick=${tick} role=${role}`);
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

  // --- PART 1: QUORUM SYNC ---
  const qx = 205, qy = 105;
  const quorumScript = Uint8Array.of(RISC.OP_COLLECTIVE, 6, 0, 0, RISC.OP_NOP);
  
  STATE_MATRIX.seedAtom(0, 101n, qx, qy, 5000, 100, undefined, quorumScript);
  STATE_MATRIX.seedAtom(1, 102n, qx, qy, 5000, 100, undefined, new Uint8Array(64));
  STATE_MATRIX.seedAtom(2, 103n, qx, qy, 5000, 100, undefined, new Uint8Array(64));
  STATE_MATRIX.seedAtom(3, 104n, 405, 105, 5000, 100, undefined, new Uint8Array(64));

  STATE_MATRIX.setPC(1, 7);
  STATE_MATRIX.setPC(2, 8);
  STATE_MATRIX.setPC(3, 13);

  const gx = Math.floor(qx / 10);
  const gy = Math.floor(qy / 10);
  setSpatialCell(gy * GRID_W + gx, [0, 1, 2]);

  syncPhysicsBuffers();

  const spatialGridCount = new Int32Array(STATE_MATRIX.buffer, OFFSETS.SPATIAL_GRID_OFFSET, 140 * 80 * 32)[gy * 32 * 140 + gx * 32];
  console.error(`[DEBUG] Part 1: count at (${gx},${gy}) = ${spatialGridCount}`);
  console.error(`[DEBUG] Part 1: neighbor 0 ID = ${STATE_MATRIX.getId(0)}`);
  console.error(`[DEBUG] Part 1: neighbor 1 PC before = ${STATE_MATRIX.getPC(1)}`);

  execute_atom(0);
  reduce_atom_deltas(0, STATE_MATRIX.MAX_ATOMS);
  
  console.error(`[DEBUG] Part 1: neighbor 1 PC after = ${STATE_MATRIX.getPC(1)}`);
  const quorum: QuorumSnapshot = {
    sourcePc: STATE_MATRIX.getPC(0),
    peer1Pc: STATE_MATRIX.getPC(1),
    peer2Pc: STATE_MATRIX.getPC(2),
    outsiderPc: STATE_MATRIX.getPC(3),
  };

  // --- PART 2: SHARE AGGRESSION ---
  STATE_MATRIX.clear();
  const shareScript = Uint8Array.of(RISC.OP_SHARE, 0, 50, RISC.OP_NOP);
  STATE_MATRIX.seedAtom(0, 101n, 100, 100, 1000, 100, undefined, shareScript);
  STATE_MATRIX.seedAtom(1, 102n, 110, 110, 0, 100, undefined, new Uint8Array(64));
  STATE_MATRIX.setBondTarget(0, 0, 1);
  
  // Set Aggression Hormone (Index 2) to 1200 (> 1024)
  STATE_MATRIX.setHormone(2, 1200);

  syncPhysicsBuffers();

  console.error(`[DEBUG] Part 2: Atom 0 Energy before = ${STATE_MATRIX.getEnergy(0)}`);
  console.error(`[DEBUG] Part 2: Atom 1 Energy before = ${STATE_MATRIX.getEnergy(1)}`);
  console.error(`[DEBUG] Part 2: Bond 0->0 = ${STATE_MATRIX.getBondTarget(0, 0)}`);

  execute_atom(0);
  reduce_atom_deltas(0, STATE_MATRIX.MAX_ATOMS);

  console.error(`[DEBUG] Part 2: Atom 0 Energy after = ${STATE_MATRIX.getEnergy(0)}`);
  console.error(`[DEBUG] Part 2: Atom 1 Energy after = ${STATE_MATRIX.getEnergy(1)}`);
  const share: ShareSnapshot = {
    sourceEnergy: Math.round(STATE_MATRIX.getEnergy(0)),
    targetEnergy: Math.round(STATE_MATRIX.getEnergy(1)),
    hormoneAggression: STATE_MATRIX.getHormone(2),
  };

  const snapshot: Snapshot = { quorum, share };
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
