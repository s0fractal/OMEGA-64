import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_COLLECTIVE_TRANSPORT_CAPTURE__";

const OP_COLLECTIVE = 0xA6;
const GRID_W = 140;
const CELL_X = 105;
const CELL_Y = 105;
const HIVE_ADDR = 1;
const HIVE_VALUE = 88;
const SIGNAL_INTENSITY = 200;
const SIGNAL_TYPE = 5;

type AtomSnapshot = {
  idx: number;
  energy: number;
  pc: number;
  role: number;
  reg0: number;
};

type Snapshot = {
  hiveValue: number;
  hiveBalance: number;
  pheromoneWord: number;
  pheromoneCellIdx: number;
  pheromoneX: number;
  pheromoneY: number;
  atoms: AtomSnapshot[];
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

const collectiveScript = (
  mode: number,
  p2: number,
  p3: number,
): Uint8Array => {
  const script = new Uint8Array(64);
  script[0] = OP_COLLECTIVE;
  script[1] = mode & 0xFF;
  script[2] = p2 & 0xFF;
  script[3] = p3 & 0xFF;
  return script;
};

const buildSnapshot = (): Snapshot => {
  const gx = Math.floor(CELL_X / 10);
  const gy = Math.floor(CELL_Y / 10);
  const cellIdx = gy * GRID_W + gx;
  const signalGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.SIGNAL_GRID_OFFSET,
    140 * 80,
  );

  return {
    hiveValue: STATE_MATRIX.getHiveMemory(HIVE_ADDR),
    hiveBalance: STATE_MATRIX.getHiveBalance(),
    pheromoneWord: signalGrid[cellIdx] ?? 0,
    pheromoneCellIdx: cellIdx,
    pheromoneX: CELL_X,
    pheromoneY: CELL_Y,
    atoms: [0, 1, 2].map((idx) => ({
      idx,
      energy: STATE_MATRIX.getEnergy(idx),
      pc: STATE_MATRIX.getPC(idx),
      role: STATE_MATRIX.getRole(idx),
      reg0: STATE_MATRIX.getReg(idx, 0),
    })),
  };
};

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();
  STATE_MATRIX.setHiveBalance(1000);

  const wasmBytes = await Deno.readFile("../../00/release.wasm");
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

  STATE_MATRIX.seedAtom(
    0,
    1n,
    CELL_X,
    CELL_Y,
    5000,
    100,
    undefined,
    collectiveScript(0, HIVE_ADDR, HIVE_VALUE),
  );
  STATE_MATRIX.seedAtom(
    1,
    2n,
    CELL_X,
    CELL_Y,
    5000,
    100,
    undefined,
    collectiveScript(1, HIVE_ADDR, 0),
  );
  STATE_MATRIX.seedAtom(
    2,
    3n,
    CELL_X,
    CELL_Y,
    5000,
    100,
    undefined,
    collectiveScript(2, SIGNAL_INTENSITY, SIGNAL_TYPE),
  );

  execute_atom(0);
  execute_atom(1);
  execute_atom(2);

  const snapshot = buildSnapshot();
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

  const expectedWord = (SIGNAL_INTENSITY << 8) | SIGNAL_TYPE;
  if (payload.snapshot.hiveValue !== HIVE_VALUE) {
    throw new Error(
      `[collective_transport_capture] hiveValue mismatch: ${payload.snapshot.hiveValue}`,
    );
  }
  if (payload.snapshot.atoms[1]?.reg0 !== HIVE_VALUE) {
    throw new Error(
      `[collective_transport_capture] load reg0 mismatch: ${
        payload.snapshot.atoms[1]?.reg0 ?? -1
      }`,
    );
  }
  if ((payload.snapshot.pheromoneWord & 0xFFFF) !== expectedWord) {
    throw new Error(
      `[collective_transport_capture] pheromone mismatch: ${payload.snapshot.pheromoneWord}`,
    );
  }
  console.log(
    `[collective_transport_capture] ok hash=${payload.hash} hive=${payload.snapshot.hiveValue} reg0=${
      payload.snapshot.atoms[1]?.reg0 ?? -1
    } pheromone=0x${payload.snapshot.pheromoneWord.toString(16)}`,
  );
};

await main();
