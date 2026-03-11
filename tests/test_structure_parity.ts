import { STATE_MATRIX, STRUCTURE } from "../00_substrate/mod.ts";
import * as OFFSETS from "../00_substrate/mod.ts";
import { STRUCTURE_ENGINE } from "../01_physics/STRUCTURE_ENGINE.ts";

const GRID_W = 140;
const GRID_H = 80;
const GRID_SIZE = GRID_W * GRID_H;

type WasmStructureExports = {
  tick_structure_grid?: () => void;
  tick_matrix?: () => void;
};

const gridIndex = (x: number, y: number): number => y * GRID_W + x;

const setCell = (
  structureGrid: Int32Array,
  x: number,
  y: number,
  type: number,
  density = 0,
  charge = 0,
  state = 0,
) => {
  structureGrid[gridIndex(x, y)] = ((state & 0xFF) << 24) |
    ((charge & 0xFF) << 16) | ((density & 0xFF) << 8) | (type & 0xFF);
};

const decodeCell = (cell: number) => ({
  type: cell & 0xFF,
  density: (cell >> 8) & 0xFF,
  charge: (cell >> 16) & 0xFF,
  state: (cell >> 24) & 0xFF,
});

async function loadWasm(): Promise<WasmStructureExports> {
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
  return instantiated.instance.exports as unknown as WasmStructureExports;
}

function seedScenario(structureGrid: Int32Array) {
  structureGrid.fill(0);

  // Propagation chain
  setCell(structureGrid, 5, 5, STRUCTURE.SOURCE, 0, 255, 0);
  for (let x = 6; x <= 10; x++) {
    setCell(structureGrid, x, 5, STRUCTURE.WIRE, 0, 0, 0);
  }

  // Node behavior (AND)
  setCell(structureGrid, 12, 5, STRUCTURE.NODE, 0, 0, 1);
  setCell(structureGrid, 11, 5, STRUCTURE.WIRE, 0, 210, 0);
  setCell(structureGrid, 12, 4, STRUCTURE.WIRE, 0, 220, 0);

  // Diode directional transfer from right neighbor (state=1)
  setCell(structureGrid, 20, 10, STRUCTURE.DIODE, 0, 0, 1);
  setCell(structureGrid, 21, 10, STRUCTURE.WIRE, 0, 180, 0);

  // Capacitor slow-decay behavior
  setCell(structureGrid, 30, 12, STRUCTURE.CAPACITOR, 0, 0, 0);
  setCell(structureGrid, 31, 12, STRUCTURE.WIRE, 0, 200, 0);

  // Autopoiesis: charged neighborhood should regrow VOID into WIRE
  setCell(structureGrid, 40, 20, STRUCTURE.VOID, 0, 0, 0);
  setCell(structureGrid, 41, 20, STRUCTURE.WIRE, 0, 230, 0);

  // Entropic collapse: isolated low-charge structure should decay to VOID
  setCell(structureGrid, 50, 30, STRUCTURE.WIRE, 0, 5, 0);
}

function compareSnapshots(jsSnap: Int32Array, wasmSnap: Int32Array): string[] {
  const diffs: string[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    if (jsSnap[i] === wasmSnap[i]) continue;
    const x = i % GRID_W;
    const y = Math.floor(i / GRID_W);
    const j = decodeCell(jsSnap[i]);
    const w = decodeCell(wasmSnap[i]);
    diffs.push(
      `cell(${x},${y}) js={t:${j.type},d:${j.density},c:${j.charge},s:${j.state}} wasm={t:${w.type},d:${w.density},c:${w.charge},s:${w.state}}`,
    );
    if (diffs.length >= 20) break;
  }
  return diffs;
}

async function runTest() {
  console.log("🧪 [TEST] STRUCTURE parity (JS vs WASM)...");
  STATE_MATRIX.clear();

  const structureGrid = new Int32Array(
    STATE_MATRIX.buffer,
    OFFSETS.STRUCTURE_GRID_OFFSET,
    GRID_SIZE,
  );
  seedScenario(structureGrid);
  const initialSnapshot = structureGrid.slice();
  const ticks = 8;

  // JS reference path
  structureGrid.set(initialSnapshot);
  for (let t = 0; t < ticks; t++) STRUCTURE_ENGINE.tick();
  const jsSnapshot = structureGrid.slice();

  // WASM kernel path
  const wasm = await loadWasm();
  const tickStructure = wasm.tick_structure_grid ?? wasm.tick_matrix;
  if (!tickStructure) {
    throw new Error(
      "[TEST] WASM exports missing tick_structure_grid/tick_matrix.",
    );
  }

  structureGrid.set(initialSnapshot);
  for (let t = 0; t < ticks; t++) tickStructure();
  const wasmSnapshot = structureGrid.slice();

  const diffs = compareSnapshots(jsSnapshot, wasmSnapshot);
  if (diffs.length > 0) {
    console.error("❌ [TEST] STRUCTURE parity mismatch.");
    for (const d of diffs) console.error(`   ${d}`);
    throw new Error(
      `[TEST] Found ${diffs.length}+ differing cells after ${ticks} ticks.`,
    );
  }

  console.log(
    `✅ [TEST] STRUCTURE parity verified (${ticks} ticks, ${GRID_SIZE} cells).`,
  );
}

if (import.meta.main) {
  runTest()
    .then(() => Deno.exit(0))
    .catch((err) => {
      console.error(err);
      Deno.exit(1);
    });
}
