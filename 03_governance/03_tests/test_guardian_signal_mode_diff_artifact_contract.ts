const DIFF_ROOT = "03_governance/03_tests/verification/hybrid_mode_diffs";
const REQUIRED_ARTIFACTS = [
  "gh01_gt03_guardian_stable_modes.json",
  "gh02_gt03_guardian_repair_modes.json",
  "gh03_gt03_guardian_fallback_modes.json",
] as const;

const main = async () => {
  const missing: string[] = [];

  for (const file of REQUIRED_ARTIFACTS) {
    const path = `${DIFF_ROOT}/${file}`;
    try {
      const parsed = JSON.parse(
        await Deno.readTextFile(path),
      ) as Record<string, unknown>;
      const parityOk = parsed.parity_ok;
      if (parityOk !== true) {
        throw new Error(
          `[guardian-signal-mode-diff-artifacts] parity not ok for ${file}`,
        );
      }
      if (
        typeof parsed.legacy_digest !== "string" ||
        typeof parsed.shadow_digest !== "string" ||
        typeof parsed.hybrid_digest !== "string"
      ) {
        throw new Error(
          `[guardian-signal-mode-diff-artifacts] digest fields missing for ${file}`,
        );
      }
    } catch (err) {
      missing.push(`${path} :: ${String(err)}`);
    }
  }

  if (missing.length > 0) {
    console.error(
      "[guardian-signal-mode-diff-artifacts] missing or invalid artifacts.",
    );
    for (const entry of missing) console.error(` - ${entry}`);
    Deno.exit(1);
  }

  console.log(
    `[guardian-signal-mode-diff-artifacts] contract guard passed. artifacts=${REQUIRED_ARTIFACTS.length}`,
  );
};

await main();
