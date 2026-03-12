import {
  type DaemonIngressPlan,
  type DaemonInvariantAdmission,
  type DaemonNarrativeContext,
  evaluateInvariantAdmission,
  evaluatePlasmidPolicy,
  evaluatePlasmidRisk,
  normalizeDaemonNarrativeContext,
  planInvariantIngress,
  type PlasmidRiskProfile,
} from "../DAEMON_INGRESS_POLICY.ts";
import {
  ADMISSION_SHADOW_CASES,
  type AdmissionShadowCaseDefinition,
} from "./admission_shadow_cases.ts";
import { goldenTraceArtifactPaths } from "./golden_trace_catalog.ts";

type AdmissionBaselineAnchor = {
  traceId: string;
  scenario: string;
  runtimeMode: string;
  eventKind: string;
  tickEnd: number;
  codexSnapshotDigest: string;
  invariantDigest: string;
  response: Record<string, unknown>;
};

type AdmissionShadowOutcome = {
  context: DaemonNarrativeContext;
  policy: { ok: boolean; reason: string } | null;
  risk: PlasmidRiskProfile | null;
  admission: DaemonInvariantAdmission | null;
  plan: DaemonIngressPlan | null;
  blocked: boolean;
  blockReason: string | null;
};

export type AdmissionShadowResult = {
  caseId: string;
  baseline: Omit<AdmissionBaselineAnchor, "response">;
  shadow: AdmissionShadowOutcome;
  parity: {
    ok: boolean;
    reasons: string[];
  };
};

export type AdmissionShadowArtifact = {
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
  expectation_summary: AdmissionShadowCaseDefinition["expected"];
};

const ADMISSION_DIFF_ROOT = "verification/admission_diffs";

const equalStringArray = (
  a: readonly string[],
  b: readonly string[],
): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort((
    [a],
    [b],
  ) => a.localeCompare(b));
  return `{${
    entries.map(([key, item]) =>
      `${JSON.stringify(key)}:${stableStringify(item)}`
    ).join(",")
  }}`;
};

const sha256Hex = async (value: unknown): Promise<string> => {
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const normalizeResponse = (
  response: Record<string, unknown>,
): {
  policyOk: boolean | null;
  policyReason: string | null;
  risk: {
    level: string | null;
    score: number | null;
    opcode: number | null;
  };
  admission: {
    severity: string;
    score: number;
    reasons: string[];
    context: {
      mood: string;
      sharedCenter: string;
      dominantInvariantVector: string;
      codexLineageLabel: string;
      codexLineageGuardScore: number;
      codexLineageGuardReasons: string[];
    };
  };
  appliedAction: string;
  degraded: boolean;
  degradeReason: string | null;
} => {
  const admissionRoot =
    response.admission && typeof response.admission === "object"
      ? response.admission as Record<string, unknown>
      : {};
  const latestAdmissionRoot =
    response.latest_admission && typeof response.latest_admission === "object"
      ? response.latest_admission as Record<string, unknown>
      : {};
  const admissionLike = Object.keys(admissionRoot).length > 0
    ? admissionRoot
    : latestAdmissionRoot;
  const contextRoot =
    admissionLike.context && typeof admissionLike.context === "object"
      ? admissionLike.context as Record<string, unknown>
      : {};
  const plasmidRisk =
    response.plasmid_risk && typeof response.plasmid_risk === "object"
      ? response.plasmid_risk as Record<string, unknown>
      : null;
  return {
    policyOk: typeof response.ok === "boolean" ? response.ok : null,
    policyReason: typeof response.reason === "string" ? response.reason : null,
    risk: {
      level: plasmidRisk && typeof plasmidRisk.level === "string"
        ? plasmidRisk.level
        : null,
      score: plasmidRisk && typeof plasmidRisk.score === "number"
        ? plasmidRisk.score
        : null,
      opcode: plasmidRisk && typeof plasmidRisk.opcode === "number"
        ? plasmidRisk.opcode
        : null,
    },
    admission: {
      severity: typeof admissionLike.severity === "string"
        ? admissionLike.severity
        : "UNKNOWN",
      score: typeof admissionLike.score === "number" ? admissionLike.score : -1,
      reasons: Array.isArray(admissionLike.reasons)
        ? admissionLike.reasons.filter((item): item is string =>
          typeof item === "string"
        )
        : [],
      context: {
        mood: typeof contextRoot.mood === "string"
          ? contextRoot.mood
          : "UNKNOWN",
        sharedCenter: typeof contextRoot.sharedCenter === "string"
          ? contextRoot.sharedCenter
          : "unknown",
        dominantInvariantVector:
          typeof contextRoot.dominantInvariantVector === "string"
            ? contextRoot.dominantInvariantVector
            : "unknown",
        codexLineageLabel: typeof contextRoot.codexLineageLabel === "string"
          ? contextRoot.codexLineageLabel
          : "unknown",
        codexLineageGuardScore:
          typeof contextRoot.codexLineageGuardScore === "number"
            ? contextRoot.codexLineageGuardScore
            : -1,
        codexLineageGuardReasons:
          Array.isArray(contextRoot.codexLineageGuardReasons)
            ? contextRoot.codexLineageGuardReasons.filter((
              item,
            ): item is string => typeof item === "string")
            : [],
      },
    },
    appliedAction: typeof response.applied_action === "string"
      ? response.applied_action
      : typeof latestAdmissionRoot.appliedAction === "string"
      ? latestAdmissionRoot.appliedAction
      : "UNKNOWN",
    degraded: response.degraded === true ||
      latestAdmissionRoot.degraded === true,
    degradeReason: typeof response.degrade_reason === "string"
      ? response.degrade_reason
      : typeof latestAdmissionRoot.reason === "string" &&
          latestAdmissionRoot.appliedAction === "BLOCKED"
      ? null
      : null,
  };
};

const loadBaselineAnchor = async (
  definition: AdmissionShadowCaseDefinition,
): Promise<AdmissionBaselineAnchor> => {
  const { traceJson } = goldenTraceArtifactPaths(definition.baselineTraceId);
  const parsed = JSON.parse(
    await Deno.readTextFile(traceJson),
  ) as Record<string, unknown>;
  const eventLog = Array.isArray(parsed.event_log)
    ? parsed.event_log.filter((entry) => entry && typeof entry === "object")
    : [];
  const matched = eventLog.find((entry) =>
    (entry as Record<string, unknown>).kind === definition.baselineEventKind
  );
  if (!matched || typeof matched !== "object") {
    throw new Error(
      `[admission_shadow] baseline event ${definition.baselineEventKind} missing in ${definition.baselineTraceId}`,
    );
  }
  const event = matched as Record<string, unknown>;
  if (!event.response || typeof event.response !== "object") {
    throw new Error(
      `[admission_shadow] baseline response missing for ${definition.id}`,
    );
  }
  return {
    traceId: definition.baselineTraceId,
    scenario: String(parsed.scenario ?? definition.baselineTraceId),
    runtimeMode: String(parsed.runtime_mode ?? "unknown"),
    eventKind: definition.baselineEventKind,
    tickEnd: Number(parsed.tick_end ?? -1),
    codexSnapshotDigest: String(parsed.codex_snapshot_digest ?? "missing"),
    invariantDigest: String(parsed.invariant_digest ?? "missing"),
    response: event.response as Record<string, unknown>,
  };
};

const runAdmissionShadow = (
  definition: AdmissionShadowCaseDefinition,
): AdmissionShadowOutcome => {
  const context = normalizeDaemonNarrativeContext(
    definition.narrativeSeed,
    definition.dominantGenome,
  );
  const policy = definition.envelope.action_type === "INJECT_PLASMID" &&
      definition.envelope.payload.hex_code
    ? evaluatePlasmidPolicy(definition.envelope.payload.hex_code)
    : null;
  const risk = definition.envelope.action_type === "INJECT_PLASMID" &&
      definition.envelope.payload.hex_code
    ? evaluatePlasmidRisk(
      definition.envelope.payload.hex_code,
      definition.envelope.payload.intensity,
    )
    : null;
  if (policy && !policy.ok) {
    return {
      context,
      policy,
      risk: null,
      admission: null,
      plan: null,
      blocked: true,
      blockReason: policy.reason,
    };
  }
  const admission = evaluateInvariantAdmission(
    definition.envelope,
    definition.metrics,
    context,
    risk,
  );
  const plan = planInvariantIngress(definition.envelope, admission);
  return {
    context,
    policy,
    risk,
    admission,
    plan,
    blocked: false,
    blockReason: null,
  };
};

const compareToBaseline = (
  definition: AdmissionShadowCaseDefinition,
  baseline: AdmissionBaselineAnchor,
  shadow: AdmissionShadowOutcome,
): { ok: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  const baselineResponse = normalizeResponse(baseline.response);
  const expected = definition.expected;

  const policyOk = shadow.policy?.ok ?? null;
  const policyReason = shadow.policy?.reason ?? null;
  const riskLevel = shadow.risk?.level ?? null;
  const riskScore = shadow.risk?.score ?? null;
  const riskOpcode = shadow.risk?.opcode ?? null;

  if (policyOk !== expected.policyOk) {
    reasons.push(`expected policyOk=${expected.policyOk} got=${policyOk}`);
  }
  if (policyReason !== expected.policyReason) {
    reasons.push(
      `expected policyReason=${expected.policyReason} got=${policyReason}`,
    );
  }
  if (shadow.blocked !== expected.blocked) {
    reasons.push(`expected blocked=${expected.blocked} got=${shadow.blocked}`);
  }
  if (shadow.blockReason !== expected.blockReason) {
    reasons.push(
      `expected blockReason=${expected.blockReason} got=${shadow.blockReason}`,
    );
  }
  if (riskLevel !== expected.plasmidRiskLevel) {
    reasons.push(
      `expected riskLevel=${expected.plasmidRiskLevel} got=${riskLevel}`,
    );
  }
  if (riskScore !== expected.plasmidRiskScore) {
    reasons.push(
      `expected riskScore=${expected.plasmidRiskScore} got=${riskScore}`,
    );
  }
  if (riskOpcode !== expected.plasmidRiskOpcode) {
    reasons.push(
      `expected riskOpcode=${expected.plasmidRiskOpcode} got=${riskOpcode}`,
    );
  }
  if ((shadow.admission?.severity ?? null) !== expected.severity) {
    reasons.push(
      `expected severity=${expected.severity} got=${
        shadow.admission?.severity ?? null
      }`,
    );
  }
  if ((shadow.admission?.score ?? null) !== expected.score) {
    reasons.push(
      `expected score=${expected.score} got=${shadow.admission?.score ?? null}`,
    );
  }
  if (!equalStringArray(shadow.admission?.reasons ?? [], expected.reasons)) {
    reasons.push("expected reasons mismatch");
  }
  if (
    (shadow.plan?.applied.action_type ?? "BLOCKED") !== expected.appliedAction
  ) {
    reasons.push(
      `expected appliedAction=${expected.appliedAction} got=${
        shadow.plan?.applied.action_type ?? "BLOCKED"
      }`,
    );
  }
  if ((shadow.plan?.degraded ?? null) !== expected.degraded) {
    reasons.push(
      `expected degraded=${expected.degraded} got=${
        shadow.plan?.degraded ?? null
      }`,
    );
  }
  if ((shadow.plan?.degradeReason ?? null) !== expected.degradeReason) {
    reasons.push(
      `expected degradeReason=${expected.degradeReason} got=${
        shadow.plan?.degradeReason ?? null
      }`,
    );
  }
  if (shadow.blocked) {
    if (baselineResponse.policyOk !== policyOk) {
      reasons.push(
        `baseline policyOk=${baselineResponse.policyOk} shadow=${policyOk}`,
      );
    }
    if (baselineResponse.policyReason !== policyReason) {
      reasons.push(
        `baseline policyReason=${baselineResponse.policyReason} shadow=${policyReason}`,
      );
    }
    if (baselineResponse.appliedAction !== expected.appliedAction) {
      reasons.push(
        `baseline appliedAction=${baselineResponse.appliedAction} expected=${expected.appliedAction}`,
      );
    }
    return { ok: reasons.length === 0, reasons };
  }
  if (baselineResponse.risk.level !== riskLevel) {
    reasons.push(
      `baseline riskLevel=${baselineResponse.risk.level} shadow=${riskLevel}`,
    );
  }
  if (baselineResponse.risk.score !== riskScore) {
    reasons.push(
      `baseline riskScore=${baselineResponse.risk.score} shadow=${riskScore}`,
    );
  }
  if (baselineResponse.risk.opcode !== riskOpcode) {
    reasons.push(
      `baseline riskOpcode=${baselineResponse.risk.opcode} shadow=${riskOpcode}`,
    );
  }
  if (baselineResponse.admission.severity !== shadow.admission.severity) {
    reasons.push(
      `baseline severity=${baselineResponse.admission.severity} shadow=${shadow.admission.severity}`,
    );
  }
  if (baselineResponse.admission.score !== shadow.admission.score) {
    reasons.push(
      `baseline score=${baselineResponse.admission.score} shadow=${shadow.admission.score}`,
    );
  }
  if (
    !equalStringArray(
      baselineResponse.admission.reasons,
      shadow.admission.reasons,
    )
  ) {
    reasons.push("baseline reasons mismatch");
  }
  if (baselineResponse.appliedAction !== shadow.plan.applied.action_type) {
    reasons.push(
      `baseline appliedAction=${baselineResponse.appliedAction} shadow=${shadow.plan.applied.action_type}`,
    );
  }
  if (baselineResponse.degraded !== shadow.plan.degraded) {
    reasons.push(
      `baseline degraded=${baselineResponse.degraded} shadow=${shadow.plan.degraded}`,
    );
  }
  if (baselineResponse.degradeReason !== shadow.plan.degradeReason) {
    reasons.push(
      `baseline degradeReason=${baselineResponse.degradeReason} shadow=${shadow.plan.degradeReason}`,
    );
  }
  if (
    baselineResponse.admission.context.sharedCenter !==
      shadow.context.sharedCenter
  ) {
    reasons.push("baseline sharedCenter mismatch");
  }
  if (
    baselineResponse.admission.context.dominantInvariantVector !==
      shadow.context.dominantInvariantVector
  ) {
    reasons.push("baseline dominantInvariantVector mismatch");
  }
  if (
    baselineResponse.admission.context.codexLineageLabel !==
      shadow.context.codexLineageLabel
  ) {
    reasons.push("baseline codexLineageLabel mismatch");
  }
  if (
    baselineResponse.admission.context.codexLineageGuardScore !==
      shadow.context.codexLineageGuardScore
  ) {
    reasons.push("baseline codexLineageGuardScore mismatch");
  }
  if (
    !equalStringArray(
      baselineResponse.admission.context.codexLineageGuardReasons,
      shadow.context.codexLineageGuardReasons,
    )
  ) {
    reasons.push("baseline codexLineageGuardReasons mismatch");
  }

  return { ok: reasons.length === 0, reasons };
};

const artifactForResult = async (
  definition: AdmissionShadowCaseDefinition,
  baseline: AdmissionBaselineAnchor,
  shadow: AdmissionShadowOutcome,
  parity: { ok: boolean; reasons: string[] },
): Promise<AdmissionShadowArtifact> => {
  const normalizedBaseline = normalizeResponse(baseline.response);
  const policyOk = shadow.policy?.ok ?? null;
  const policyReason = shadow.policy?.reason ?? null;
  const blocked = shadow.blocked;
  return {
    case_id: definition.id,
    baseline_trace_id: baseline.traceId,
    baseline_event_kind: baseline.eventKind,
    parity_ok: parity.ok,
    parity_reasons: [...parity.reasons],
    baseline_digest: await sha256Hex(normalizedBaseline),
    shadow_digest: await sha256Hex({
      policyOk,
      policyReason,
      risk: shadow.risk,
      admission: shadow.admission,
      plan: shadow.plan,
      blocked: shadow.blocked,
      blockReason: shadow.blockReason,
    }),
    diff: {
      policy_match: definition.expected.policyOk === policyOk,
      policy_reason_match: definition.expected.policyReason === policyReason,
      risk_match: blocked
        ? definition.expected.plasmidRiskLevel === null &&
          definition.expected.plasmidRiskScore === null &&
          definition.expected.plasmidRiskOpcode === null
        : normalizedBaseline.risk.level === (shadow.risk?.level ?? null) &&
          normalizedBaseline.risk.score === (shadow.risk?.score ?? null) &&
          normalizedBaseline.risk.opcode === (shadow.risk?.opcode ?? null),
      severity_match: blocked
        ? definition.expected.severity === null
        : normalizedBaseline.admission.severity ===
          (shadow.admission?.severity ?? "UNKNOWN"),
      score_match: blocked
        ? definition.expected.score === null
        : normalizedBaseline.admission.score ===
          (shadow.admission?.score ?? -1),
      reasons_match: blocked
        ? equalStringArray(definition.expected.reasons, [])
        : equalStringArray(
          normalizedBaseline.admission.reasons,
          shadow.admission?.reasons ?? [],
        ),
      applied_action_match: normalizedBaseline.appliedAction ===
        (shadow.plan?.applied.action_type ?? "BLOCKED"),
      degraded_match: blocked
        ? definition.expected.degraded === null
        : normalizedBaseline.degraded === (shadow.plan?.degraded ?? false),
      degrade_reason_match: blocked
        ? definition.expected.degradeReason === null
        : normalizedBaseline.degradeReason ===
          (shadow.plan?.degradeReason ?? null),
      context_match: blocked
        ? true
        : normalizedBaseline.admission.context.sharedCenter ===
            shadow.context.sharedCenter &&
          normalizedBaseline.admission.context.dominantInvariantVector ===
            shadow.context.dominantInvariantVector &&
          normalizedBaseline.admission.context.codexLineageLabel ===
            shadow.context.codexLineageLabel &&
          normalizedBaseline.admission.context.codexLineageGuardScore ===
            shadow.context.codexLineageGuardScore &&
          equalStringArray(
            normalizedBaseline.admission.context.codexLineageGuardReasons,
            shadow.context.codexLineageGuardReasons,
          ),
    },
    expectation_summary: definition.expected,
  };
};

export const writeAdmissionHarnessArtifacts = async (
  results: AdmissionShadowResult[],
): Promise<void> => {
  await Deno.mkdir(ADMISSION_DIFF_ROOT, { recursive: true });
  for (const result of results) {
    const definition = ADMISSION_SHADOW_CASES.find((item) =>
      item.id === result.caseId
    );
    if (!definition) {
      throw new Error(
        `[admission_shadow] missing case definition for ${result.caseId}`,
      );
    }
    const baseline = await loadBaselineAnchor(definition);
    const artifact = await artifactForResult(
      definition,
      baseline,
      result.shadow,
      result.parity,
    );
    const path = `${ADMISSION_DIFF_ROOT}/${definition.id}.json`;
    await Deno.writeTextFile(`${path}.tmp`, JSON.stringify(artifact, null, 2));
    await Deno.rename(`${path}.tmp`, path);
  }
};

export const runAdmissionShadowHarness = async (): Promise<
  AdmissionShadowResult[]
> => {
  const results: AdmissionShadowResult[] = [];
  for (const definition of ADMISSION_SHADOW_CASES) {
    const baseline = await loadBaselineAnchor(definition);
    const shadow = runAdmissionShadow(definition);
    const parity = compareToBaseline(definition, baseline, shadow);
    results.push({
      caseId: definition.id,
      baseline: {
        traceId: baseline.traceId,
        scenario: baseline.scenario,
        runtimeMode: baseline.runtimeMode,
        eventKind: baseline.eventKind,
        tickEnd: baseline.tickEnd,
        codexSnapshotDigest: baseline.codexSnapshotDigest,
        invariantDigest: baseline.invariantDigest,
      },
      shadow,
      parity,
    });
  }
  return results;
};

const main = async () => {
  const results = await runAdmissionShadowHarness();
  await writeAdmissionHarnessArtifacts(results);
  const failed = results.filter((result) => !result.parity.ok);
  if (failed.length > 0) {
    console.error("[admission_shadow] parity failure.");
    for (const result of failed) {
      console.error(` - ${result.caseId}`);
      console.error(`   reasons: ${result.parity.reasons.join(" | ")}`);
    }
    Deno.exit(1);
  }
  console.log(`[admission_shadow] capture complete. cases=${results.length}`);
};

if (import.meta.main) {
  await main();
}
