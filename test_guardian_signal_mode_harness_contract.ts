import { runGuardianSignalModeHarness } from "./verification/guardian_signal_mode_harness.ts";

const main = async () => {
  const results = await runGuardianSignalModeHarness();
  const failed = results.filter((result) => !result.parity.ok);
  if (failed.length > 0) {
    console.error("[guardian-signal-mode-harness] parity failure.");
    for (const result of failed) {
      console.error(` - ${result.caseId}`);
      console.error(`   reasons: ${result.parity.reasons.join(" | ")}`);
    }
    Deno.exit(1);
  }

  console.log(
    `[guardian-signal-mode-harness] contract guard passed. cases=${results.length}`,
  );
};

await main();
