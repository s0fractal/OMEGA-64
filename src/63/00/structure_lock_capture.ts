import { GRID_W, GRID_H } from "../../00/OFFSETS.ts";
import { STATE_MATRIX, STRUCTURE } from "../STATE_MATRIX.ts";
import * as OFFSETS from "../OFFSETS.ts";

const CAPTURE_MARKER = "__OMEGA_STRUCTURE_LOCK_CAPTURE__";
const LOCK_BIT = -2147483648;
const OP_SENSE = 0xA9;
const OP_JMP = 0x12;

type SenseSnapshot = {
  centerX: number;
  centerY: number;
  neighborCellIdx: number;
  neighborType: number;
  senseReg: number;
  pc: number;
};

type IntentClearingSnapshot = {
  cellIdx: number;
  resolvedType: number;
  resolvedCharge: number;
  ownerIntent: number;
  valueIntent: number;
  chargeIntent: number;
};

type Snapshot = {
  visibleSense: SenseSnapshot;
  typedMissSense: SenseSnapshot;
  intentClearing: IntentClearingSnapshot;
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

const gridIndex = (x: number, y: number): number => y * GRID_W + x;

const senseScript = (targetType: number): Uint8Array => {
  const script = new Uint8Array(64);
  script[0] = OP_SENSE;
  script[1] = 1;
  script[2] = targetType & 0xFF;
  script[3] = OP_JMP;
  script[4] = 0;
  return script;
};

const runSenseCapture = (
  execute_atom: (idx: number) => void,
  targetType: number,
): SenseSnapshot => {
  STATE_MATRIX.clear();

  const centerX = 705;
  const centerY = 405;
  const gx = Math.floor(centerX / 10);
  const gy = Math.floor(centerY / 10);
  const neighborCellIdx = gridIndex(gx + 1, gy);

  STATE_MATRIX.seedAtom(
    0,
    1n,
    centerX,
    centerY,
    2000,
    0,
    new Uint8Array(8),
    senseScript(targetType),
  );

  const structureGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_GRID_OFFSET,
    GRID_W * GRID_H,
  );
  const ownerIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET,
    GRID_W * GRID_H,
  );

  structureGrid[neighborCellIdx] = STRUCTURE.WIRE;
  ownerIntents[neighborCellIdx] = LOCK_BIT;

  execute_atom(0);

  return {
    centerX,
    centerY,
    neighborCellIdx,
    neighborType: structureGrid[neighborCellIdx] & 0xFF,
    senseReg: STATE_MATRIX.getReg(0, 1),
    pc: STATE_MATRIX.getPC(0),
  };
};

const runIntentClearingCapture = (
  tickStructure: () => void,
): IntentClearingSnapshot => {
  STATE_MATRIX.clear();

  const cellIdx = gridIndex(64, 24);
  const structureGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_GRID_OFFSET,
    GRID_W * GRID_H,
  );
  const ownerIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET,
    GRID_W * GRID_H,
  );
  const valueIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET,
    GRID_W * GRID_H,
  );
  const chargeIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_CHARGE_INTENT_OFFSET,
    GRID_W * GRID_H,
  );

  structureGrid[cellIdx] = STRUCTURE.VOID;
  ownerIntents[cellIdx] = LOCK_BIT | 17;
  valueIntents[cellIdx] = ((3 & 0xFF) << 24) | (STRUCTURE.NODE & 0xFF);
  chargeIntents[cellIdx] = 180;

  tickStructure();

  const resolvedCell = structureGrid[cellIdx];
  return {
    cellIdx,
    resolvedType: resolvedCell & 0xFF,
    resolvedCharge: (resolvedCell >> 16) & 0xFF,
    ownerIntent: ownerIntents[cellIdx],
    valueIntent: valueIntents[cellIdx],
    chargeIntent: chargeIntents[cellIdx],
  };
};

const runCapture = async (): Promise<CapturePayload> => {
  const wasm = await loadWasm();
  const tickStructure = wasm.tick_structure_grid ?? wasm.tick_matrix;
  if (!tickStructure) {
    throw new Error(
      "[structure_lock_capture] WASM exports missing tick_structure_grid/tick_matrix.",
    );
  }

  const snapshot: Snapshot = {
    visibleSense: runSenseCapture(wasm.execute_atom, STRUCTURE.WIRE),
    typedMissSense: runSenseCapture(wasm.execute_atom, STRUCTURE.NODE),
    intentClearing: runIntentClearingCapture(tickStructure),
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

  if (payload.snapshot.visibleSense.senseReg !== 1) {
    throw new Error(
      `[structure_lock_capture] visible sense mismatch: ${payload.snapshot.visibleSense.senseReg}`,
    );
  }
  if (payload.snapshot.typedMissSense.senseReg !== 0) {
    throw new Error(
      `[structure_lock_capture] typed miss mismatch: ${payload.snapshot.typedMissSense.senseReg}`,
    );
  }
  if (payload.snapshot.intentClearing.ownerIntent !== 0) {
    throw new Error(
      `[structure_lock_capture] owner intent not cleared: ${payload.snapshot.intentClearing.ownerIntent}`,
    );
  }
  if (payload.snapshot.intentClearing.valueIntent !== 0) {
    throw new Error(
      `[structure_lock_capture] value intent not cleared: ${payload.snapshot.intentClearing.valueIntent}`,
    );
  }
  if (payload.snapshot.intentClearing.chargeIntent !== 0) {
    throw new Error(
      `[structure_lock_capture] charge intent not cleared: ${payload.snapshot.intentClearing.chargeIntent}`,
    );
  }
  if (payload.snapshot.intentClearing.resolvedType !== STRUCTURE.NODE) {
    throw new Error(
      `[structure_lock_capture] resolved type mismatch: ${payload.snapshot.intentClearing.resolvedType}`,
    );
  }
  if (payload.snapshot.intentClearing.resolvedCharge < 150) {
    throw new Error(
      `[structure_lock_capture] resolved charge too low: ${payload.snapshot.intentClearing.resolvedCharge}`,
    );
  }

  console.log(
    `[structure_lock_capture] ok hash=${payload.hash} visible=${payload.snapshot.visibleSense.senseReg} typedMiss=${payload.snapshot.typedMissSense.senseReg} charge=${payload.snapshot.intentClearing.resolvedCharge}`,
  );
};

await main();
