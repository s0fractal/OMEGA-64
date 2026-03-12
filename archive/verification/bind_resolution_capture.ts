import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_BIND_CAPTURE__";

type Snapshot = {
  initiatorId: number;
  targetId: number;
  requestStatus: number;
};

type CapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: Snapshot;
};

type WasmExports = {
  execute_atom: (idx: number) => void;
};

const hashHex = async (payload: string): Promise<string> => {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const loadWasm = async (): Promise<WasmExports> => {
  const wasmBytes = await Deno.readFile("../../08_artifacts/release.wasm");
  const trace_atom = (
    idx: number,
    op: number,
    p1: number,
    p2: number,
    p3: number,
  ) => {
    // console.log(`[WASM TRACE] atom=${idx} op=0x${op.toString(16)} p1=${p1} p2=${p2} p3=${p3}`);
  };
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom },
    env: {
      memory: STATE_MATRIX.wasmMemory,
      trace_atom,
      abort: () => {},
    },
  });
  return instance.exports as unknown as WasmExports;
};

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const wasm = await loadWasm();

  // Atoms
  STATE_MATRIX.seedAtom(1, 101n, 100, 100, 5000, 100);
  STATE_MATRIX.seedAtom(2, 201n, 105, 105, 5000, 100);

  // OP_BIND (0x82) for atom 1
  const script = new Uint8Array(64);
  script[0] = 0x82;
  STATE_MATRIX.setInstructions(1, script);

  // Sync READ buffers (used by execute_atom)
  const readXs = new Int16Array(
    STATE_MATRIX.buffer,
    OFFSETS.PHYSICS_READ_XS_OFFSET,
    OFFSETS.MAX_ATOMS,
  );
  const readYs = new Int16Array(
    STATE_MATRIX.buffer,
    OFFSETS.PHYSICS_READ_YS_OFFSET,
    OFFSETS.MAX_ATOMS,
  );
  const readEnergy = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
    OFFSETS.MAX_ATOMS,
  );
  const readResonance = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
    OFFSETS.MAX_ATOMS,
  );

  readXs[1] = 100;
  readYs[1] = 100;
  readXs[2] = 105;
  readYs[2] = 105;
  readEnergy[1] = 5000 * 1000; // Energy with scale
  readResonance[1] = 100;

  // Populating the spatial grid cell (10, 10)
  const gridIdx = 1410; // (10 * 140) + 10
  const gridByteOff = OFFSETS.SPATIAL_GRID_OFFSET + (gridIdx * 128);
  const gridIntView = new Int32Array(STATE_MATRIX.buffer, gridByteOff, 32);
  gridIntView[0] = 2; // Count
  gridIntView[1] = 1; // Index 1
  gridIntView[2] = 2; // Index 2

  wasm.execute_atom(1);

  // Capture bond request from atom index 1
  const reqByteOff = OFFSETS.BOND_REQUESTS_OFFSET + (1 * 12);
  const reqIntView = new Int32Array(STATE_MATRIX.buffer, reqByteOff, 3);

  const snapshot: Snapshot = {
    initiatorId: reqIntView[0],
    targetId: reqIntView[1],
    requestStatus: reqIntView[2],
  };

  const hash = await hashHex(JSON.stringify(snapshot));
  return {
    workerCount: 1,
    strictDeterminism: true,
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

  console.log(
    `[bind_resolution_capture] ok initiator=${payload.snapshot.initiatorId} target=${payload.snapshot.targetId} status=${payload.snapshot.requestStatus}`,
  );
};

await main();
