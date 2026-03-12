import { STATE_MATRIX, wasmMemory } from "@00";
import { GLYPH_BUFFER } from "@01";

async function runGeneticEvolutionTests() {
  console.log("🕸️ [TEST] Booting Genetic Evolution diagnostics...");

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

  // 2. Setup Atom
  const atomIdx = 50;
  const originalGenome = 0xAA55AA55AA55AA55n;
  STATE_MATRIX.setId(atomIdx, 500n);
  STATE_MATRIX.setEnergy(atomIdx, 5000);
  STATE_MATRIX.setResonance(atomIdx, 1000);
  STATE_MATRIX.setX(atomIdx, 500);
  STATE_MATRIX.setY(atomIdx, 500);

  // Population of READ buffers for KERNEL simulation
  const readXs = new Int16Array(
    STATE_MATRIX.buffer,
    8000000 + 40400000,
    100000,
  );
  const readYs = new Int16Array(
    STATE_MATRIX.buffer,
    8000000 + 40600000,
    100000,
  );
  const readEnergy = new Int32Array(
    STATE_MATRIX.buffer,
    8000000 + 40800000,
    100000,
  );
  const readResonance = new Int32Array(
    STATE_MATRIX.buffer,
    8000000 + 41200000,
    100000,
  );

  readXs[atomIdx] = 500;
  readYs[atomIdx] = 500;
  readEnergy[atomIdx] = 5000;
  readResonance[atomIdx] = 1000;

  // Set Logic (Genome)
  const logicView = new BigUint64Array(
    STATE_MATRIX.buffer,
    8000000 + 2400000,
    100000,
  ); // LOGIC_OFFSET
  logicView[atomIdx] = originalGenome;

  // 3. Program: OP_REPLICATE (0x80)
  const code = new Uint32Array(16);
  code[0] = 0x80;
  STATE_MATRIX.setCode(atomIdx, code);
  STATE_MATRIX.setPC(atomIdx, 0);

  // 4. Test Case A: High Friction (No mutations expected)
  console.log("--- Testing with HIGH mutation_friction (friction=1024) ---");
  STATE_MATRIX.setHormone(5, 1024); // H5: mutation_friction (Range 0..2048)
  // Mutation chance is (seed % 1024) > (friction >> 1).
  // If friction=1024, friction >> 1 = 512. Chance is 50%.
  // To minimize chance, set friction=2048. friction >> 1 = 1024. seed % 1024 is always <= 1023. No mutation.
  STATE_MATRIX.setHormone(5, 2048);

  const spawnBuffer = new DataView(
    STATE_MATRIX.buffer,
    8000000 + 19600000 + 8,
    1024 * 16,
  );

  execute_atom(atomIdx);

  const childGenome1 = spawnBuffer.getBigUint64(0, true);
  console.log(`Original: ${originalGenome.toString(16)}`);
  console.log(`Child 1:  ${childGenome1.toString(16)}`);

  if (childGenome1 !== originalGenome) {
    console.error("❌ Mutation occurred despite maximum friction!");
    Deno.exit(1);
  }

  // 5. Test Case B: Low Friction (Mutations expected)
  console.log("--- Testing with LOW mutation_friction (friction=0) ---");
  STATE_MATRIX.setHormone(5, 0);
  // Chance: (seed % 1024) > 0. Almost 100%.

  // Reset PC and energy/resonance
  STATE_MATRIX.setPC(atomIdx, 0);
  STATE_MATRIX.setEnergy(atomIdx, 5000);
  STATE_MATRIX.setResonance(atomIdx, 1000);

  // We need to clear the spawn head or just track it
  // Let's just run multiple times and look for ANY mutation
  let mutationsFound = 0;
  const iterations = 10;

  const headView = new Int32Array(STATE_MATRIX.buffer, 8000000 + 19600000, 1);

  for (let i = 0; i < iterations; i++) {
    const currentHead = Atomics.load(headView, 0) % 1024;
    execute_atom(atomIdx);
    STATE_MATRIX.setPC(atomIdx, 0);
    STATE_MATRIX.setEnergy(atomIdx, 5000); // Keep energy high for replication
    STATE_MATRIX.setResonance(atomIdx, 1000);

    const childGen = spawnBuffer.getBigUint64(currentHead * 16, true);
    if (childGen !== originalGenome) {
      console.log(`Iteration ${i}: Mutation! ${childGen.toString(16)}`);
      mutationsFound++;
    }
  }

  console.log(`Total mutations found: ${mutationsFound} / ${iterations}`);
  if (mutationsFound === 0) {
    console.error("❌ No mutations found despite zero friction!");
    Deno.exit(1);
  }

  // 6. Check Resonance Tax
  console.log("--- Verifying metabolic tax ---");
  // Run one more time with low friction to ensure a mutation likely happens
  const resBefore = STATE_MATRIX.getResonance(atomIdx);
  execute_atom(atomIdx);
  const resAfter = STATE_MATRIX.getResonance(atomIdx);

  // Base replication adds 30 resonance in code: resonance = resonance + 30;
  // Mutation subtracts 50: resonance = resonance - 50;
  // Total change should be -20 if mutation occurred.
  // Wait, getResonance returns what's in memory.
  // resonance is local in execute_atom. It's stored back at the end.

  const delta = resAfter - resBefore;
  console.log(`Resonance delta: ${delta}`);
  if (delta !== 28 && delta !== -22) {
    console.error(`❌ Unexpected resonance delta: ${delta}`);
    Deno.exit(1);
  }

  console.log("✅ [TEST] Genetic Evolution verified via KERNEL!");
  Deno.exit(0);
}

runGeneticEvolutionTests();
