import { MX } from "@g";
import { GLYPH_TELEMETRY } from "@g";
import { ENERGY_OFFSET } from "@g";

/**
 * Stage 5.3: Secretion Energetics Audit
 * Verifies that atom energy correctly decreases upon chemical secretion.
 */

async function runAudit() {
  console.log("🧪 Stage 5.3: Secretion Energetics Audit Starting...");

  // 1. Snapshot initial state
  const energyView = new Int32Array(
    MX.buffer,
    ENERGY_OFFSET,
    1000,
  );
  const initialEnergyCopy = new Int32Array(energyView);

  console.log("Waiting for secretions...");

  // 2. Wait for a few ticks to allow secretions to occur
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const snap = GLYPH_TELEMETRY.snapshot();
    console.log(
      `Tick ${i}: PheroSeeds=${snap.internalAtomPheromoneSeeds}, PlasmidSeeds=${snap.internalAtomPlasmidSeeds}, SignalLeaks=${snap.internalSignalSeeds}, MemoryLeaks=${snap.internalMemorySeeds}`,
    );

    if (snap.internalSignalSeeds > 0 || snap.internalMemorySeeds > 0) {
      console.log("✅ Internal Reflection leaks detected!");
    }
  }

  // 3. Compare energy
  let decreasedCount = 0;
  let totalDelta = 0;

  for (let i = 0; i < 1000; i++) {
    if (energyView[i] > 0 && energyView[i] < initialEnergyCopy[i]) {
      const delta = initialEnergyCopy[i] - energyView[i];
      console.log(
        `Atom ${i}: Energy decreased by ${delta} (from ${
          initialEnergyCopy[i]
        } to ${energyView[i]})`,
      );
      decreasedCount++;
      totalDelta += delta;
    }
  }

  if (decreasedCount > 0) {
    console.log(
      `✅ Audit Passed: ${decreasedCount} atoms showed energy depletion. Total Energy Lost: ${
        totalDelta / 1000
      } units.`,
    );
  } else {
    console.warn(
      "⚠️ Warning: No energy depletion detected. Verify if atoms are actually secreting.",
    );
  }

  // 4. Check Internal Reflection Leaks
  const snap = GLYPH_TELEMETRY.snapshot();
  console.log(
    `📊 Reflection Leaks: Signal=${snap.internalSignalSeeds}, Memory=${snap.internalMemorySeeds}`,
  );

  if (snap.internalSignalSeeds > 0 || snap.internalMemorySeeds > 0) {
    console.log(
      "✅ Audit Passed: Internal Reflection leaks successfully quantified.",
    );
  } else {
    console.warn(
      "⚠️ Warning: No reflection leaks detected. Verify grid activity.",
    );
  }
}

runAudit().catch(console.error);
