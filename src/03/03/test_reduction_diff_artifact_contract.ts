import { REDUCTION_CASES } from "./reduction_cases.ts";

const ARTIFACT_ROOT = "src/03/03/verification/reduction_diffs";

const main = async () => {
  for (const definition of REDUCTION_CASES) {
    const path = `${ARTIFACT_ROOT}/${definition.id}.json`;
    const stat = await Deno.stat(path);
    if (!stat.isFile) {
      throw new Error(`[reduction_diff_artifacts] missing file: ${path}`);
    }
    const parsed = JSON.parse(
      await Deno.readTextFile(path),
    ) as Record<string, unknown>;
    if (parsed.case_id !== definition.id) {
      throw new Error(
        `[reduction_diff_artifacts] case id mismatch for ${definition.id}`,
      );
    }
    if (parsed.parity_ok !== true) {
      throw new Error(
        `[reduction_diff_artifacts] parity artifact must be true for ${definition.id}`,
      );
    }
  }

  console.log(
    `[reduction_diff_artifacts] contract guard passed. cases=${REDUCTION_CASES.length}`,
  );
};

await main();
