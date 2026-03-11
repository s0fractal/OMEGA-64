const DIFF_ROOT = "verification/architect_hybrid_mode_diffs";
const REQUIRED_ARTIFACTS = [
  "ah01_gt04_architect_emit_modes.json",
  "ah02_gt04_architect_suppress_modes.json",
  "ah03_gt04_architect_fallback_modes.json",
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
          `[architect-plasmid-mode-diff-artifacts] parity not ok for ${file}`,
        );
      }
      if (
        typeof parsed.legacy_digest !== "string" ||
        typeof parsed.shadow_digest !== "string" ||
        typeof parsed.hybrid_digest !== "string"
      ) {
        throw new Error(
          `[architect-plasmid-mode-diff-artifacts] digest fields missing for ${file}`,
        );
      }
    } catch (err) {
      missing.push(`${path} :: ${String(err)}`);
    }
  }

  if (missing.length > 0) {
    console.error(
      "[architect-plasmid-mode-diff-artifacts] missing or invalid artifacts.",
    );
    for (const entry of missing) console.error(` - ${entry}`);
    Deno.exit(1);
  }

  console.log(
    `[architect-plasmid-mode-diff-artifacts] contract guard passed. artifacts=${REQUIRED_ARTIFACTS.length}`,
  );
};

await main();
