import { runReductionHarness } from "./verification/reduction_harness.ts";

const main = async () => {
  const results = await runReductionHarness();
  const failed = results.filter((result) => !result.parity.ok);
  if (failed.length > 0) {
    console.error("[reduction_harness] parity failure.");
    for (const result of failed) {
      console.error(` - ${result.caseId}`);
      console.error(`   reasons: ${result.parity.reasons.join(" | ")}`);
    }
    Deno.exit(1);
  }

  console.log(
    `[reduction_harness] contract guard passed. cases=${results.length}`,
  );
};

await main();
