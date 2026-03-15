// OMEGA-64 | test_shannon_entropy.ts | Stage 37 Verification
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.210.0/assert/mod.ts";
import { STATE_MATRIX } from "@generated";
import { PULSE } from "@02";
import { LOGGER } from "@generated";

Deno.test("Stage 37: Information Thermodynamics (Noise Tax)", async () => {
  LOGGER.info("--- STAGE 37: SHANNON ENTROPY NOISE TAX TEST ---");

  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.tickCounter, 0, 100);
  await PULSE.initWorkers(1);

  const atomA = 100; // Low Entropy
  const atomB = 101; // High Entropy

  STATE_MATRIX.setId(atomA, 100n);
  STATE_MATRIX.setEnergy(atomA, 10000); // 10,000 Energy

  STATE_MATRIX.setId(atomB, 101n);
  STATE_MATRIX.setEnergy(atomB, 10000); // 10,000 Energy

  // Atom A (Low Entropy)
  // Genome: JMP 0 (0x12, 0x00), followed by 62 bytes of 0x00
  const scriptA = new Uint8Array(64);
  scriptA.fill(0);
  scriptA[0] = 0x12; // JMP
  scriptA[1] = 0;
  STATE_MATRIX.setInstructions(atomA, scriptA);

  // Atom B (High Entropy)
  // Genome: JMP 0 (0x12, 0x00), followed by 62 bytes of high entropy crypto random data
  const scriptB = new Uint8Array(64);
  crypto.getRandomValues(scriptB);
  scriptB[0] = 0x12; // JMP
  scriptB[1] = 0;
  STATE_MATRIX.setInstructions(atomB, scriptB);

  console.log(
    "Executing physics loop for 50 ticks to accumulate metabolic costs...",
  );
  for (let i = 0; i < 50; i++) {
    await PULSE.tick();
  }

  const energyA = STATE_MATRIX.getEnergy(atomA);
  const energyB = STATE_MATRIX.getEnergy(atomB);

  const pcA = Atomics.load(
    new Uint8Array(STATE_MATRIX.contexts.buffer),
    STATE_MATRIX.contexts.byteOffset + atomA * 64 + 32,
  );
  const pcB = Atomics.load(
    new Uint8Array(STATE_MATRIX.contexts.buffer),
    STATE_MATRIX.contexts.byteOffset + atomB * 64 + 32,
  );
  const entropyA = Atomics.load(STATE_MATRIX.contexts, atomA * 16 + 15);
  const entropyB = Atomics.load(STATE_MATRIX.contexts, atomB * 16 + 15);

  console.log(
    `Atom A - Remaining Energy: ${energyA}, PC: ${pcA}, EntropyCache: ${entropyA}`,
  );
  console.log(
    `Atom B - Remaining Energy: ${energyB}, PC: ${pcB}, EntropyCache: ${entropyB}`,
  );

  // Both execute JMP 0. Base gas cost implies base_compute_cost = 100 per tick.
  // Tax applies only to B.

  assert(
    energyA > energyB,
    "Atom A (Low Entropy) should have significantly more energy remaining than Atom B (High Entropy)",
  );

  const delta = energyA - energyB;
  console.log(`Metabolic Delta (Noise Tax sum): ${delta} Energy Units`);

  assert(
    delta > 2.0,
    "Noise tax delta should be substantial over 50 ticks",
  );

  console.log("--- STAGE 37: SUCCESS ---");
  PULSE.stopWorkers();
});
