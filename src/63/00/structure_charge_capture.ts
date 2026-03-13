import { GRID_W, GRID_H } from "../../00/OFFSETS.ts";
import { STATE_MATRIX, STRUCTURE } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_STRUCTURE_CHARGE_CAPTURE__";
const OP_SET = 0x01;
const OP_PLUG = 0xA4;

type BeforeTickSnapshot = {
  targetCellIdx: number;
  chargeIntent: number;
};

type AfterTickSnapshot = {
  targetCellIdx: number;
  resolvedType: number;
  resolvedCharge: number;
  chargeIntent: number;
};

type Snapshot = {
  beforeTick: BeforeTickSnapshot;
  afterTick: AfterTickSnapshot;
};

type CapturePayload = {
  workerCount: number;
  strictDeterminism: boolean;
  hash: string;
  snapshot: Snapshot;
};

type WasmExports = {
  execute_atom: (idx: number) => void;
  tick_structure_grid?: () => void;
  tick_matrix?: () => void;
};

const hashHex = async (payload: string): Promise<string> => {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const loadWasm = async (): Promise<WasmExports> => {
  const wasmBytes = await Deno.readFile("src/00/release.wasm");
  const trace_atom = (
    _idx: number,
    _op: number,
    _gx: number,
    _gy: number,
    _target: number,
  ) => {};
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

const chargeScript = (charge: number): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = OP_SET;
  script[pc++] = 0;
  script[pc++] = charge & 0xFF;
  script[pc++] = OP_PLUG;
  script[pc++] = 1;
  script[pc++] = 0;
  return script;
};

const targetCellIdxFor = (x: number, y: number): number =>
  Math.floor(y / 10) * GRID_W + Math.floor(x / 10);

const runCapture = async (): Promise<CapturePayload> => {
  STATE_MATRIX.clear();

  const wasm = await loadWasm();
  const tickStructure = wasm.tick_structure_grid ?? wasm.tick_matrix;
  if (!tickStructure) {
    throw new Error(
      "[structure_charge_capture] WASM exports missing tick_structure_grid/tick_matrix.",
    );
  }

  const centerX = 35;
  const centerY = 35;
  const targetCellIdx = targetCellIdxFor(centerX, centerY);

  STATE_MATRIX.seedAtom(
    0,
    1n,
    centerX,
    centerY,
    1000,
    1,
    new Uint8Array(8),
    chargeScript(180),
  );

  const structureGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_GRID_OFFSET,
    GRID_W * GRID_H,
  );
  const chargeIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_CHARGE_INTENT_OFFSET,
    GRID_W * GRID_H,
  );

  structureGrid[targetCellIdx] = STRUCTURE.WIRE;

  wasm.execute_atom(0);

  const beforeTick: BeforeTickSnapshot = {
    targetCellIdx,
    chargeIntent: chargeIntents[targetCellIdx],
  };

  tickStructure();

  const resolvedCell = structureGrid[targetCellIdx];
  const afterTick: AfterTickSnapshot = {
    targetCellIdx,
    resolvedType: resolvedCell & 0xFF,
    resolvedCharge: (resolvedCell >> 16) & 0xFF,
    chargeIntent: chargeIntents[targetCellIdx],
  };

  const snapshot: Snapshot = {
    beforeTick,
    afterTick,
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

  if (payload.snapshot.beforeTick.chargeIntent !== 180) {
    throw new Error(
      `[structure_charge_capture] charge intent mismatch before tick: ${payload.snapshot.beforeTick.chargeIntent}`,
    );
  }
  if (payload.snapshot.afterTick.resolvedType !== STRUCTURE.WIRE) {
    throw new Error(
      `[structure_charge_capture] resolved type mismatch: ${payload.snapshot.afterTick.resolvedType}`,
    );
  }
  if (payload.snapshot.afterTick.resolvedCharge !== 170) {
    throw new Error(
      `[structure_charge_capture] resolved charge mismatch: ${payload.snapshot.afterTick.resolvedCharge}`,
    );
  }
  if (payload.snapshot.afterTick.chargeIntent !== 0) {
    throw new Error(
      `[structure_charge_capture] charge intent not cleared after tick: ${payload.snapshot.afterTick.chargeIntent}`,
    );
  }

  console.log(
    `[structure_charge_capture] ok hash=${payload.hash} beforeCharge=${payload.snapshot.beforeTick.chargeIntent} resolvedCharge=${payload.snapshot.afterTick.resolvedCharge}`,
  );
};

await main();
