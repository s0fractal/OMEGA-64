import { PULSE } from "@07/02_runners/02_metabolism/mod.ts";
import { STATE_MATRIX } from "@07/02_runners/00_substrate/mod.ts";
import { SOVEREIGN_ORACLE } from "@07/02_runners/05_exocortex/mod.ts";
import { LOGGER } from "@07/02_runners/00_substrate/mod.ts";
import { evaluateGuardianSignalPromotion } from "@07/02_runners/03_governance/mod.ts";
import { COLDSTART_BOOTSTRAP } from "@07/02_runners/63_necropolis/mod.ts";
import { RUNTIME_POLICY } from "@03";

async function run() {
  console.log("Initializing Pulse for Stage 8 verification...");

  // 1. Seed the world in the SAME process memory
  const seedResult = COLDSTART_BOOTSTRAP.seed({
    ...RUNTIME_POLICY.coldstart,
    enabled: true,
  });
  console.log("Seed Result:", seedResult);

  await PULSE.initWorkers();

  console.log("Running 50 ticks to gather metrics...");
  for (let i = 0; i < 50; i++) {
    // Fluctuate coherence to trigger different branches
    SOVEREIGN_ORACLE.neuralCoherence = (i % 2 === 0) ? 100 : 0;
    await PULSE.tick();
    if (i % 10 === 0) {
      const state = PULSE.getGuardianSignalHybridState();
      console.log(
        `Tick ${i}: shadowRuns=${state.shadowRuns}, stable=${state.stableBranchCount}, repair=${state.repairBranchCount}, fallback=${state.fallbackRuns} (last: ${state.lastFallbackReason})`,
      );
    }
  }

  const finalState = PULSE.getGuardianSignalHybridState();
  console.log("\n--- Final Guardian Signal Hybrid State ---");
  console.log(JSON.stringify(finalState, null, 2));

  const promotion = evaluateGuardianSignalPromotion(finalState);
  console.log("\n--- Promotion Readiness ---");
  console.log(JSON.stringify(promotion, null, 2));

  Deno.exit(0);
}

run().catch((err) => {
  console.error("Verification failed:", err);
  Deno.exit(1);
});
