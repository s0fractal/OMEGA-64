import { STATE_MATRIX, STRUCTURE } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";

const GRID_W = 140;
const LOCK_BIT = -2147483648;

const gridIndex = (x: number, y: number): number => y * GRID_W + x;

type WasmExports = {
  execute_atom: (idx: number) => void;
  tick_structure_grid?: () => void;
  tick_matrix?: () => void;
};

const loadWasm = async (): Promise<WasmExports> => {
  const wasmBytes = await Deno.readFile("./build/release.wasm");
  const trace_atom = (
    _idx: number,
    _op: number,
    _gx: number,
    _gy: number,
    _target: number,
  ) => {};
  const instantiated = await WebAssembly.instantiate(wasmBytes, {
    index: {
      trace_atom,
    },
    env: {
      memory: STATE_MATRIX.wasmMemory,
      abort: () => {},
      trace_atom,
    },
  });
  return instantiated.instance.exports as unknown as WasmExports;
};

const testIntentClearing = async () => {
  STATE_MATRIX.clear();
  const wasm = await loadWasm();
  const tickStructure = wasm.tick_structure_grid ?? wasm.tick_matrix;
  if (!tickStructure) {
    throw new Error(
      "[TEST] WASM exports missing tick_structure_grid/tick_matrix.",
    );
  }

  const testCell = gridIndex(64, 24);
  const structureGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_GRID_OFFSET,
    GRID_W * 80,
  );
  const ownerIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET,
    GRID_W * 80,
  );
  const valueIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET,
    GRID_W * 80,
  );
  const chargeIntents = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_CHARGE_INTENT_OFFSET,
    GRID_W * 80,
  );

  // Seed a stale lock + pending intents.
  structureGrid[testCell] = STRUCTURE.VOID;
  ownerIntents[testCell] = LOCK_BIT | 17;
  valueIntents[testCell] = ((3 & 0xFF) << 24) | (STRUCTURE.NODE & 0xFF);
  chargeIntents[testCell] = 180;

  tickStructure();

  if (ownerIntents[testCell] !== 0) {
    throw new Error(
      `[TEST] expected owner intent cleared, got=${ownerIntents[testCell]}`,
    );
  }
  if (valueIntents[testCell] !== 0) {
    throw new Error(
      `[TEST] expected value intent cleared, got=${valueIntents[testCell]}`,
    );
  }
  if (chargeIntents[testCell] !== 0) {
    throw new Error(
      `[TEST] expected charge intent cleared, got=${chargeIntents[testCell]}`,
    );
  }

  const cell = structureGrid[testCell];
  const cellType = cell & 0xFF;
  const cellCharge = (cell >> 16) & 0xFF;
  if (cellType !== STRUCTURE.NODE) {
    throw new Error(
      `[TEST] expected resolved structure type NODE, got=${cellType}`,
    );
  }
  if (cellCharge < 150) {
    throw new Error(
      `[TEST] expected merged charge >=150 after intent apply, got=${cellCharge}`,
    );
  }
};

const run = async () => {
  console.log("🧪 [TEST] Structure lock progress and intent clearing...");
  await testIntentClearing();
  console.log(
    "✅ [TEST] Structure lock progress and intent clearing verified.",
  );
};

if (import.meta.main) {
  run()
    .then(() => Deno.exit(0))
    .catch((err) => {
      console.error(err);
      Deno.exit(1);
    });
}
