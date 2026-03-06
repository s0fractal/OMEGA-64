import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_COLLECTIVE_SYNCHRONY_CAPTURE__";
const OP_COLLECTIVE = 0xA6;
const GRID_W = 140;
const PHASE_CELL_X = 105;
const PHASE_CELL_Y = 105;
const QUORUM_CELL_X = 205;
const QUORUM_CELL_Y = 105;
const OUTSIDER_CELL_X = 405;
const OUTSIDER_CELL_Y = 105;

type PhaseLockSnapshot = {
  sourcePc: number;
  peer1Pc: number;
  peer2Pc: number;
  peer1InitialPc: number;
  peer2InitialPc: number;
};

type QuorumSnapshot = {
  sourcePc: number;
  peer1Pc: number;
  peer2Pc: number;
  outsiderPc: number;
  peer1InitialPc: number;
  peer2InitialPc: number;
  outsiderInitialPc: number;
  cellIdx: number;
  cellCount: number;
};

type Snapshot = {
  phaseLock: PhaseLockSnapshot;
  quorum: QuorumSnapshot;
};

type CapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
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

const collectiveScript = (mode: number): Uint8Array => {
  const script = new Uint8Array(64);
  script[0] = OP_COLLECTIVE;
  script[1] = mode & 0xFF;
  script[2] = 0;
  script[3] = 0;
  return script;
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

const runPhaseLockCapture = (
  execute_atom: (idx: number) => void,
): PhaseLockSnapshot => {
  STATE_MATRIX.clear();

  STATE_MATRIX.seedAtom(
    0,
    1n,
    PHASE_CELL_X,
    PHASE_CELL_Y,
    5000,
    100,
    undefined,
    collectiveScript(5),
  );
  STATE_MATRIX.seedAtom(
    1,
    2n,
    PHASE_CELL_X,
    PHASE_CELL_Y,
    5000,
    100,
    undefined,
    new Uint8Array(64),
  );
  STATE_MATRIX.seedAtom(
    2,
    3n,
    PHASE_CELL_X,
    PHASE_CELL_Y,
    5000,
    100,
    undefined,
    new Uint8Array(64),
  );

  STATE_MATRIX.setPC(1, 9);
  STATE_MATRIX.setPC(2, 10);
  STATE_MATRIX.setBondTarget(0, 0, 1);
  STATE_MATRIX.setBondTarget(0, 1, 2);

  execute_atom(0);

  return {
    sourcePc: STATE_MATRIX.getPC(0),
    peer1Pc: STATE_MATRIX.getPC(1),
    peer2Pc: STATE_MATRIX.getPC(2),
    peer1InitialPc: 9,
    peer2InitialPc: 10,
  };
};

const runQuorumCapture = (
  execute_atom: (idx: number) => void,
): QuorumSnapshot => {
  STATE_MATRIX.clear();

  STATE_MATRIX.seedAtom(
    0,
    1n,
    QUORUM_CELL_X,
    QUORUM_CELL_Y,
    5000,
    100,
    undefined,
    collectiveScript(6),
  );
  STATE_MATRIX.seedAtom(
    1,
    2n,
    QUORUM_CELL_X,
    QUORUM_CELL_Y,
    5000,
    100,
    undefined,
    new Uint8Array(64),
  );
  STATE_MATRIX.seedAtom(
    2,
    3n,
    QUORUM_CELL_X,
    QUORUM_CELL_Y,
    5000,
    100,
    undefined,
    new Uint8Array(64),
  );
  STATE_MATRIX.seedAtom(
    3,
    4n,
    OUTSIDER_CELL_X,
    OUTSIDER_CELL_Y,
    5000,
    100,
    undefined,
    new Uint8Array(64),
  );

  STATE_MATRIX.setPC(1, 7);
  STATE_MATRIX.setPC(2, 8);
  STATE_MATRIX.setPC(3, 13);

  const gx = Math.floor(QUORUM_CELL_X / 10);
  const gy = Math.floor(QUORUM_CELL_Y / 10);
  const cellIdx = gy * GRID_W + gx;
  setSpatialCell(cellIdx, [0, 1, 2]);

  execute_atom(0);

  return {
    sourcePc: STATE_MATRIX.getPC(0),
    peer1Pc: STATE_MATRIX.getPC(1),
    peer2Pc: STATE_MATRIX.getPC(2),
    outsiderPc: STATE_MATRIX.getPC(3),
    peer1InitialPc: 7,
    peer2InitialPc: 8,
    outsiderInitialPc: 13,
    cellIdx,
    cellCount: 3,
  };
};

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const wasmBytes = await Deno.readFile("./build/release.wasm");
  const trace_atom = (
    _idx: number,
    _op: number,
    _p1: number,
    _p2: number,
    _p3: number,
  ) => {};
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom },
    env: {
      memory: STATE_MATRIX.wasmMemory,
      trace_atom,
      abort: () => {},
    },
  });

  const execute_atom = instance.exports.execute_atom as (idx: number) => void;

  const snapshot: Snapshot = {
    phaseLock: runPhaseLockCapture(execute_atom),
    quorum: runQuorumCapture(execute_atom),
  };
  const hash = await hashHex(JSON.stringify(snapshot));
  return {
    workerCount: Number(Deno.env.get("OMEGA_PULSE_WORKERS") ?? "1"),
    strictDeterminism: (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1",
    hash,
    snapshot,
  };
};

const main = async () => {
  const payload = await runCapture();
  if (Deno.args.includes("--capture")) {
    console.log(`${CAPTURE_MARKER}${JSON.stringify(payload)}`);
    return;
  }

  if (payload.snapshot.phaseLock.sourcePc !== 4) {
    throw new Error(
      `[collective_synchrony_capture] phase source pc mismatch: ${payload.snapshot.phaseLock.sourcePc}`,
    );
  }
  if (payload.snapshot.phaseLock.peer1Pc !== 4) {
    throw new Error(
      `[collective_synchrony_capture] phase peer1 pc mismatch: ${payload.snapshot.phaseLock.peer1Pc}`,
    );
  }
  if (payload.snapshot.phaseLock.peer2Pc !== 4) {
    throw new Error(
      `[collective_synchrony_capture] phase peer2 pc mismatch: ${payload.snapshot.phaseLock.peer2Pc}`,
    );
  }
  if (payload.snapshot.quorum.sourcePc !== 4) {
    throw new Error(
      `[collective_synchrony_capture] quorum source pc mismatch: ${payload.snapshot.quorum.sourcePc}`,
    );
  }
  if (payload.snapshot.quorum.peer1Pc !== 4) {
    throw new Error(
      `[collective_synchrony_capture] quorum peer1 pc mismatch: ${payload.snapshot.quorum.peer1Pc}`,
    );
  }
  if (payload.snapshot.quorum.peer2Pc !== 4) {
    throw new Error(
      `[collective_synchrony_capture] quorum peer2 pc mismatch: ${payload.snapshot.quorum.peer2Pc}`,
    );
  }
  if (payload.snapshot.quorum.outsiderPc !== 13) {
    throw new Error(
      `[collective_synchrony_capture] quorum outsider pc mismatch: ${payload.snapshot.quorum.outsiderPc}`,
    );
  }
  console.log(
    `[collective_synchrony_capture] ok hash=${payload.hash} phase=[${payload.snapshot.phaseLock.peer1Pc},${payload.snapshot.phaseLock.peer2Pc}] quorum=[${payload.snapshot.quorum.peer1Pc},${payload.snapshot.quorum.peer2Pc}] outsider=${payload.snapshot.quorum.outsiderPc}`,
  );
};

await main();
