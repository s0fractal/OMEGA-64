import { GRID_W, GRID_H, GRID_CELLS } from "@generated";
import { STATE_MATRIX, wasmMemory } from "@generated";
import { RIBOSOME } from "@02";
import { GLYPH_TELEMETRY } from "@06";

async function runSecretionOpcodeTests() {
  console.log("🕸️ [TEST] Booting WASM native secretion opcode diagnostics...");

  // 1. Load WASM
  const wasmBytes = await Deno.readFile("src/00/release.wasm");
  const instantiated = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom: () => {} },
    env: {
      memory: wasmMemory,
      abort: (msg: any) => console.error("WASM ABORT:", msg),
      trace_atom: () => {},
    },
  });
  const execute_atom = instantiated.instance.exports.execute_atom as (
    idx: number,
  ) => void;

  STATE_MATRIX.clear();
  STATE_MATRIX.glyphHeaders.fill(0); STATE_MATRIX.glyphPayload.fill(0);

  // 2. Setup Architect Atom
  const atomIdx = 20; // Skip trace threshold
  STATE_MATRIX.setId(atomIdx, 100n);
  STATE_MATRIX.setEnergy(atomIdx, 1000);
  STATE_MATRIX.setRole(atomIdx, 3); // ROLE_ARCHITECT = 3
  STATE_MATRIX.setX(atomIdx, 100);
  STATE_MATRIX.setY(atomIdx, 100);

  // 3. Program: OP_COLLECTIVE mode 7 (Plasmid Emit)
  // Format: [0xA6][0x07][intensity][unused]
  const code = new Uint32Array(16);
  code[0] = 0xA6 | (7 << 8) | (128 << 16);
  STATE_MATRIX.setCode(atomIdx, code);
  STATE_MATRIX.setPC(atomIdx, 0);

  console.log("--- Executing OP_COLLECTIVE mode 7 (PLASMID_EMIT) ---");
  execute_atom(atomIdx);

  let snapshot = GLYPH_TELEMETRY.snapshot();
  console.log(`Plasmid Architect Stat: ${snapshot.atomRolePlasmid.architect}`);
  if (snapshot.atomRolePlasmid.architect !== 1) {
    console.error(
      "❌ OP_COLLECTIVE mode 7 failed to increment Architect Plasmid stat.",
    );
    Deno.exit(1);
  }

  if (snapshot.plasmidCells === 0) {
    console.error("❌ OP_COLLECTIVE mode 7 failed to deposit plasmid glyph.");
    Deno.exit(1);
  }

  // 4. Test OP_SIGNAL
  console.log("--- Executing OP_SIGNAL ---");
  const codeSignal = new Uint32Array(16);
  codeSignal[0] = 0x81; // OP_SIGNAL (1-byte opcode)
  STATE_MATRIX.setCode(atomIdx, codeSignal);
  STATE_MATRIX.setPC(atomIdx, 0);

  execute_atom(atomIdx);

  snapshot = GLYPH_TELEMETRY.snapshot();
  console.log(
    `Pheromone Architect Stat: ${snapshot.atomRolePheromone.architect}`,
  );
  if (snapshot.atomRolePheromone.architect !== 1) {
    console.error("❌ OP_SIGNAL failed to increment Architect Pheromone stat.");
    Deno.exit(1);
  }

  console.log("✅ [TEST] WASM native secretion opcodes verified via KERNEL!");

  // 5. Test Grid Leakage (glyph_transport)
  console.log("--- Executing glyph_transport for Grid Leakage ---");
  const tick_glyph_transport = instantiated.instance.exports
    .glyph_transport as (tick: number) => void;

  STATE_MATRIX.glyphHeaders.fill(0); STATE_MATRIX.glyphPayload.fill(0);

  // Set high signal in a cell (use multiple of 32 due to WASM sampling)
  const cellIdx = 512;
  Atomics.store(
    new Int32Array(STATE_MATRIX.buffer, 35200000 + 8000000, GRID_CELLS),
    cellIdx,
    1000,
  ); // SIGNAL_GRID_OFF

  // Set high memory in a cell
  const memoryBase = cellIdx * 8;
  const memoryGrid = new Uint8Array(
    STATE_MATRIX.buffer,
    36200000 + 8000000,
    GRID_CELLS * 8,
  );

  memoryGrid[memoryBase] = 200;

  tick_glyph_transport(1);

  snapshot = GLYPH_TELEMETRY.snapshot();
  console.log(`Signal Leak Stat: ${snapshot.internalSignalSeeds}`);
  console.log(`Memory Leak Stat: ${snapshot.internalMemorySeeds}`);

  if (snapshot.internalSignalSeeds !== 1) {
    console.error("❌ Signal leak failed.");
    Deno.exit(1);
  }
  if (snapshot.internalMemorySeeds !== 1) {
    console.error("❌ Memory leak failed.");
    Deno.exit(1);
  }

  console.log("✅ [TEST] WASM grid leakage verified!");
  Deno.exit(0);
}

runSecretionOpcodeTests();
