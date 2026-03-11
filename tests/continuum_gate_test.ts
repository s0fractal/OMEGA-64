import { assertEquals } from "https://deno.land/std@0.212.0/assert/mod.ts";
import { loadEpoch, saveEpoch } from "../06_akasha/mod.ts";
import { LATTICE_MEMORY_END, WASM_MEMORY_PAGES } from "../00_substrate/mod.ts";

async function hashMemArray(buffer: Uint8Array): Promise<string> {
  // crypto.subtle.digest requires ArrayBuffer, so we slice a copy if it's SharedArrayBuffer
  const copy = new Uint8Array(buffer).buffer;
  const hashBuffer = await crypto.subtle.digest("SHA-256", copy);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const WASM_RELEASE_URL = new URL("../build/release.wasm", import.meta.url);

async function instantiateOmega() {
  const wasmBytes = await Deno.readFile(WASM_RELEASE_URL);
  const memory = new WebAssembly.Memory({
    initial: WASM_MEMORY_PAGES,
    maximum: WASM_MEMORY_PAGES,
    shared: true,
  });

  const env = {
    abort: (msg: number, file: number, line: number, col: number) => {
      console.error(`abort: ${msg} ${file} ${line} ${col}`);
    },
    memory,
  };

  const index = {
    trace_atom: () => {},
  };

  const instantiated = await WebAssembly.instantiate(wasmBytes, { env, index });
  return { memory, instance: instantiated.instance };
}

Deno.test("Continuum Binary Epoch Restoration Parity", async () => {
  // 1. Initialize fresh WASM State A
  const stateA = await instantiateOmega();
  const viewA = new Uint32Array(stateA.memory.buffer);

  // Mutate memory A explicitly to simulate elapsed time
  for (let i = 0; i < 500; i++) {
    viewA[i] = i * 42;
  }

  // 2. Snapshot the state at tick 100
  await saveEpoch(stateA.memory, 100, "test_snapshot_100");

  // 3. Advance state A further 50 ticks (to 150)
  for (let i = 500; i < 1000; i++) {
    viewA[i] = i * 42;
  }
  const hashA = await hashMemArray(
    new Uint8Array(stateA.memory.buffer, 0, LATTICE_MEMORY_END),
  );

  // 4. Initialize a fresh WASM State B
  const stateB = await instantiateOmega();
  const viewB = new Uint32Array(stateB.memory.buffer);

  // Verify it is empty
  assertEquals(viewB[100], 0);

  const metaBytes = await loadEpoch(stateB.memory, "test_snapshot_100");
  assertEquals(metaBytes.tick, 100);

  // Verify restored state
  assertEquals(viewB[100], 100 * 42);

  // 5. Advance state B identical to A
  for (let i = 500; i < 1000; i++) {
    viewB[i] = i * 42;
  }
  const hashB = await hashMemArray(
    new Uint8Array(stateB.memory.buffer, 0, LATTICE_MEMORY_END),
  );

  assertEquals(
    hashA,
    hashB,
    `Chronosphere temporal drift detected at tick 150!`,
  );

  // Cleanup
  await Deno.remove(".omega/epochs/test_snapshot_100.sigma");
  await Deno.remove(".omega/epochs/test_snapshot_100.meta.json");
});
