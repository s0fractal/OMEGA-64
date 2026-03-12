// OMEGA-64 | test_doll_fork_resonance.ts | Stage 21 Verification
import { DollFork } from "@07/02/doll_fork/DOLL_FORK_MATRIX.ts";
import { DollForkRunner } from "@07/02/doll_fork/DOLL_FORK_RUNNER.ts";
import { RelicCultivator } from "@07/02/relics/RELIC_CULTIVATION.ts";
import { LOGGER } from "@00";
import { assertEquals } from "https://deno.land/std@0.211.0/assert/mod.ts";

async function testDollForkResonance() {
  LOGGER.info("--- STAGE 21: DOLL FORK RESONANCE TEST ---");

  // 1. Initialize Substrate
  const fork = new DollFork();
  const runner = new DollForkRunner(fork);
  const cultivator = new RelicCultivator(fork);

  await runner.init();
  LOGGER.info("[TEST] DollForkRunner initialized.");

  // 2. Fork from Mainline
  fork.forkFromMainline();
  const initialMetrics = fork.getMetrics();
  LOGGER.info(
    `[TEST] Forked from mainline. Population: ${initialMetrics.activePopulation}`,
  );

  // 3. Seed some shadow content if mainline is empty (for testing)
  if (initialMetrics.activePopulation === 0) {
    LOGGER.info("[TEST] Mainline empty, seeding test atom in shadow matrix.");
    fork.views.ids[0] = 1337n;
    fork.views.energies[0] = 1000;
    fork.views.resonances[0] = 300;
    fork.views.logic[0] = 0x01; // S glyph
    fork.views.roles[0] = 1; // Guardian
  }

  // 4. Run Shadow Ticks
  LOGGER.info("[TEST] Running 5 shadow ticks...");
  for (let i = 1; i <= 5; i++) {
    await runner.runShadowTick(i);
    LOGGER.info(
      `[TEST] Shadow Tick ${i} complete. Atom 0 Energy: ${
        fork.views.energies[0]
      }, Resonance: ${fork.views.resonances[0]}`,
    );
  }

  const finalMetrics = fork.getMetrics();
  LOGGER.info(
    `[TEST] Shadow ticks complete. Final population: ${finalMetrics.activePopulation}`,
  );

  // 5. Cultivate Relics
  const relics = cultivator.cultivateRelics(5);
  LOGGER.info(`[TEST] Cultivated ${relics.length} relics.`);

  // 6. Verification
  assertEquals(
    relics.length > 0,
    true,
    "Should have cultivated at least one relic from seeded data",
  );
  LOGGER.info("[TEST] Relic extraction verified.");

  // 7. Cleanup/Persist (optional for test)
  await cultivator.persistRelics(relics);

  LOGGER.info("--- STAGE 21: SUCCESS ---");
}

if (import.meta.main) {
  testDollForkResonance();
}
