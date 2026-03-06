import { runAdmissionShadowHarness } from "./verification/admission_shadow_harness.ts";

const main = async () => {
  const results = await runAdmissionShadowHarness();
  const failed = results.filter((result) => !result.parity.ok);
  if (failed.length > 0) {
    console.error("[admission_shadow_harness] parity failure.");
    for (const result of failed) {
      console.error(` - ${result.caseId}`);
      console.error(`   reasons: ${result.parity.reasons.join(" | ")}`);
    }
    Deno.exit(1);
  }

  console.log(
    `[admission_shadow_harness] contract guard passed. cases=${results.length}`,
  );
};

await main();
