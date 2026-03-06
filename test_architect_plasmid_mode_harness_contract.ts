import { runArchitectPlasmidModeHarness } from "./verification/architect_plasmid_mode_harness.ts";

const main = async () => {
  const results = await runArchitectPlasmidModeHarness();
  const failed = results.filter((result) => !result.parity.ok);
  if (failed.length > 0) {
    console.error("[architect-plasmid-mode-harness] parity failure.");
    for (const result of failed) {
      console.error(` - ${result.caseId}`);
      console.error(`   reasons: ${result.parity.reasons.join(" | ")}`);
    }
    Deno.exit(1);
  }

  console.log(
    `[architect-plasmid-mode-harness] contract guard passed. cases=${results.length}`,
  );
};

await main();
