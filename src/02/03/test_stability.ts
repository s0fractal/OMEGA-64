// OMEGA-64 | test_stability.ts | Verify RISC VM Integration
import { PULSE } from "@generated";
import { MAX_ATOMS, MX } from "@generated";

async function run() {
  console.log("🧪 Starting RISC VM Stability Test...");

  // 1. Initialize Parallel Workers
  await PULSE.initWorkers();

  // 2. Seed a test atom with a "Persistent Bio-Script"
  const idx = MX.findFreeSlot();
  if (idx === -1) throw new Error("Matrix full!");

  const id = BigInt(Date.now());
  const genome = new Uint8Array([
    0xAA,
    0xBB,
    0xCC,
    0xDD,
    0xEE,
    0xFF,
    0x00,
    0x11,
  ]);

  // Script: JNZ to self-loop (GET Energy, then GET Energy again...)
  const script = new Uint8Array(64);
  script[0] = MX.RISC.OP_GET;
  script[1] = 0;
  script[2] = MX.RISC.PROP_ENERGY;
  script[3] = MX.RISC.OP_JNZ;
  script[4] = 0;
  script[5] = 0; // Jump to PC 0 if R0 != 0

  MX.seedAtom(idx, id, 700, 400, 1000, 500, genome, script);

  console.log(`✅ Seeded atom ${idx} with script. Starting 100 pulses...`);

  // 3. Run 100 Pulses
  for (let i = 0; i < 100; i++) {
    await PULSE.tick();
    const energy = MX.getEnergy(idx);
    const pc = MX.getPC(idx);
    if (i % 20 === 0) {
      console.log(`   [PULSE ${i}] Energy: ${energy.toFixed(2)} | PC: ${pc}`);
    }
  }

  console.log("✅ Stability Test Completed Successfully.");
  Deno.exit(0);
}

run().catch((err) => {
  console.error("❌ Stability Test Failed:", err);
  Deno.exit(1);
});
