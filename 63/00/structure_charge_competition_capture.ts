import { STATE_MATRIX, STRUCTURE } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_STRUCTURE_CHARGE_COMPETITION_CAPTURE__";
const GRID_W = 140;
const GRID_H = 80;
const OP_SET = 0x01;
const OP_PLUG = 0xA4;
const LOW_CHARGE = 120;
const HIGH_CHARGE = 220;

type OrderSnapshot = {
  targetCellIdx: number;
  firstRequestedCharge: number;
  secondRequestedCharge: number;
  chargeIntentBeforeTick: number;
  resolvedType: number;
  resolvedCharge: number;
  chargeIntentAfterTick: number;
};

type Snapshot = {
  lowThenHigh: OrderSnapshot;
  highThenLow: OrderSnapshot;
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
  const wasmBytes = await Deno.readFile("../../00/release.wasm");
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
      "[structure_charge_competition_capture] WASM exports missing tick_structure_grid/tick_matrix.",
    );
  }

  const lowThenHighX = 35;
  const highThenLowX = 75;
  const y = 35;
  const lowThenHighCellIdx = targetCellIdxFor(lowThenHighX, y);
  const highThenLowCellIdx = targetCellIdxFor(highThenLowX, y);

  STATE_MATRIX.seedAtom(
    0,
    1n,
    lowThenHighX,
    y,
    1000,
    1,
    new Uint8Array(8),
    chargeScript(LOW_CHARGE),
  );
  STATE_MATRIX.seedAtom(
    1,
    2n,
    lowThenHighX,
    y,
    1000,
    1,
    new Uint8Array(8),
    chargeScript(HIGH_CHARGE),
  );
  STATE_MATRIX.seedAtom(
    2,
    3n,
    highThenLowX,
    y,
    1000,
    1,
    new Uint8Array(8),
    chargeScript(HIGH_CHARGE),
  );
  STATE_MATRIX.seedAtom(
    3,
    4n,
    highThenLowX,
    y,
    1000,
    1,
    new Uint8Array(8),
    chargeScript(LOW_CHARGE),
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

  structureGrid[lowThenHighCellIdx] = STRUCTURE.WIRE;
  structureGrid[highThenLowCellIdx] = STRUCTURE.WIRE;

  wasm.execute_atom(0);
  wasm.execute_atom(1);
  wasm.execute_atom(2);
  wasm.execute_atom(3);

  const lowThenHighBefore = chargeIntents[lowThenHighCellIdx];
  const highThenLowBefore = chargeIntents[highThenLowCellIdx];

  tickStructure();

  const lowThenHighResolved = structureGrid[lowThenHighCellIdx];
  const highThenLowResolved = structureGrid[highThenLowCellIdx];

  const snapshot: Snapshot = {
    lowThenHigh: {
      targetCellIdx: lowThenHighCellIdx,
      firstRequestedCharge: LOW_CHARGE,
      secondRequestedCharge: HIGH_CHARGE,
      chargeIntentBeforeTick: lowThenHighBefore,
      resolvedType: lowThenHighResolved & 0xFF,
      resolvedCharge: (lowThenHighResolved >> 16) & 0xFF,
      chargeIntentAfterTick: chargeIntents[lowThenHighCellIdx],
    },
    highThenLow: {
      targetCellIdx: highThenLowCellIdx,
      firstRequestedCharge: HIGH_CHARGE,
      secondRequestedCharge: LOW_CHARGE,
      chargeIntentBeforeTick: highThenLowBefore,
      resolvedType: highThenLowResolved & 0xFF,
      resolvedCharge: (highThenLowResolved >> 16) & 0xFF,
      chargeIntentAfterTick: chargeIntents[highThenLowCellIdx],
    },
  };
  const hash = await hashHex(JSON.stringify(snapshot));
  return {
    workerCount: Number(Deno.env.get("OMEGA_PULSE_WORKERS") ?? "1"),
    strictDeterminism: (Deno.env.get("OMEGA_STRICT_DETERMINISM") ?? "") === "1",
    hash,
    snapshot,
  };
};

const validateOrder = (label: string, snapshot: OrderSnapshot) => {
  if (snapshot.chargeIntentBeforeTick !== HIGH_CHARGE) {
    throw new Error(
      `[structure_charge_competition_capture] ${label} before-tick charge mismatch: ${snapshot.chargeIntentBeforeTick}`,
    );
  }
  if (snapshot.resolvedType !== STRUCTURE.WIRE) {
    throw new Error(
      `[structure_charge_competition_capture] ${label} resolved type mismatch: ${snapshot.resolvedType}`,
    );
  }
  if (snapshot.resolvedCharge !== HIGH_CHARGE - 10) {
    throw new Error(
      `[structure_charge_competition_capture] ${label} resolved charge mismatch: ${snapshot.resolvedCharge}`,
    );
  }
  if (snapshot.chargeIntentAfterTick !== 0) {
    throw new Error(
      `[structure_charge_competition_capture] ${label} charge intent not cleared: ${snapshot.chargeIntentAfterTick}`,
    );
  }
};

const main = async () => {
  const payload = await runCapture();
  if (Deno.args.includes("--capture")) {
    console.log(`${CAPTURE_MARKER}${JSON.stringify(payload)}`);
    return;
  }

  validateOrder("lowThenHigh", payload.snapshot.lowThenHigh);
  validateOrder("highThenLow", payload.snapshot.highThenLow);

  console.log(
    `[structure_charge_competition_capture] ok hash=${payload.hash} lowHigh=${payload.snapshot.lowThenHigh.resolvedCharge} highLow=${payload.snapshot.highThenLow.resolvedCharge}`,
  );
};

await main();
