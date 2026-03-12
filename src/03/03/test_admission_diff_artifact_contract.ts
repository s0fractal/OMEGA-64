const ARTIFACTS = [
  "src/03/03/verification/admission_diffs/ac01_gt04_low_risk_accept.json",
  "src/03/03/verification/admission_diffs/ac02_gt06_pheromone_accept.json",
  "src/03/03/verification/admission_diffs/ac03_gt06_plasmid_high_degrade.json",
  "src/03/03/verification/admission_diffs/ac04_gt07_plasmid_policy_block.json",
] as const;

type AdmissionShadowArtifact = {
  case_id: string;
  baseline_trace_id: string;
  baseline_event_kind: string;
  parity_ok: boolean;
  parity_reasons: string[];
  baseline_digest: string;
  shadow_digest: string;
  diff: {
    policy_match: boolean;
    policy_reason_match: boolean;
    risk_match: boolean;
    severity_match: boolean;
    score_match: boolean;
    reasons_match: boolean;
    applied_action_match: boolean;
    degraded_match: boolean;
    degrade_reason_match: boolean;
    context_match: boolean;
  };
};

const isSha256 = (value: string): boolean => /^[0-9a-f]{64}$/u.test(value);

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = async () => {
  for (const path of ARTIFACTS) {
    const raw = await Deno.readTextFile(path);
    const parsed = JSON.parse(raw) as AdmissionShadowArtifact;
    expect(
      parsed.parity_ok === true,
      `[admission_diff] parity must hold for ${path}`,
    );
    expect(
      Array.isArray(parsed.parity_reasons) &&
        parsed.parity_reasons.length === 0,
      `[admission_diff] parity reasons must be empty for ${path}`,
    );
    expect(
      isSha256(parsed.baseline_digest),
      `[admission_diff] baseline digest invalid for ${path}`,
    );
    expect(
      isSha256(parsed.shadow_digest),
      `[admission_diff] shadow digest invalid for ${path}`,
    );
    expect(
      parsed.diff.policy_match,
      `[admission_diff] policy mismatch for ${path}`,
    );
    expect(
      parsed.diff.policy_reason_match,
      `[admission_diff] policy reason mismatch for ${path}`,
    );
    expect(
      parsed.diff.risk_match,
      `[admission_diff] risk mismatch for ${path}`,
    );
    expect(
      parsed.diff.severity_match,
      `[admission_diff] severity mismatch for ${path}`,
    );
    expect(
      parsed.diff.score_match,
      `[admission_diff] score mismatch for ${path}`,
    );
    expect(
      parsed.diff.reasons_match,
      `[admission_diff] reasons mismatch for ${path}`,
    );
    expect(
      parsed.diff.applied_action_match,
      `[admission_diff] applied action mismatch for ${path}`,
    );
    expect(
      parsed.diff.degraded_match,
      `[admission_diff] degraded mismatch for ${path}`,
    );
    expect(
      parsed.diff.degrade_reason_match,
      `[admission_diff] degrade reason mismatch for ${path}`,
    );
    expect(
      parsed.diff.context_match,
      `[admission_diff] context mismatch for ${path}`,
    );
  }

  console.log(
    `[admission_diff] contract guard passed. artifacts=${ARTIFACTS.length}`,
  );
};

await main();
