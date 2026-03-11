import { STATE_MATRIX, wasmMemory } from "../00_substrate/mod.ts";

const main = async () => {
  const wasmBytes = await Deno.readFile("./build/release.wasm");
  console.log("Loaded wasm bytes", wasmBytes.length);
  const instantiated = await WebAssembly.instantiate(wasmBytes, {
    index: { trace_atom: (a: any, b: any) => console.log("TRACE:", a, b) },
    env: {
      memory: wasmMemory,
      abort: () => console.log("ABORT"),
      trace_atom: (a: any, b: any) => console.log("TRACE:", a, b),
    },
  });
  console.log("Instantiated.");
  const tickGlyphTransport = instantiated.instance.exports
    .tickGlyphTransport as (tick: number) => void;
  Atomics.store(STATE_MATRIX.signalGrid, 512, 512);
  const memoryCell = 544;
  const memoryOffset = memoryCell * 8;
  STATE_MATRIX.memoryGrid[memoryOffset] = 128;
  STATE_MATRIX.memoryGrid[memoryOffset + 4] = 9;
  STATE_MATRIX.memoryGrid[memoryOffset + 5] = 7;
  console.log("Calling tickGlyphTransport...");
  tickGlyphTransport(7);
  console.log("Done calling tickGlyphTransport.");

  const secretionStatsView = new Int32Array(
    STATE_MATRIX.buffer,
    138945860, // SECRETION_STATS_OFFSET from OFFSETS.ts
    12,
  );

  console.log(
    "Secretion Stats [10] (Signal Leak):",
    Atomics.load(secretionStatsView, 10),
  );
  console.log(
    "Secretion Stats [11] (Memory Leak):",
    Atomics.load(secretionStatsView, 11),
  );
};

main();
