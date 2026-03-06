import { STATE_MATRIX } from "../STATE_MATRIX.ts";
import {
  evaluateGuardianSignalExecution,
  type GuardianSignalExecutionDecision,
  type GuardianSignalExecutionMode,
} from "../runtime_bridge/guardian_signal_hybrid.ts";
import {
  GUARDIAN_SIGNAL_MODE_CASES,
  guardianSignalModeCaseById,
  type GuardianSignalModeCaseDefinition,
} from "./guardian_signal_mode_cases.ts";
import { goldenTraceArtifactPaths } from "./golden_trace_catalog.ts";

const HYBRID_DIFF_ROOT = "verification/hybrid_mode_diffs";

type GuardianModeResult = {
  mode: GuardianSignalExecutionMode;
  decision: GuardianSignalExecutionDecision;
};

type GuardianModeBaselineAnchor = {
  traceId: string;
  scenario: string;
  runtimeMode: string;
  tickStart: number;
  tickEnd: number;
  codexSnapshotDigest: string;
  invariantDigest: string;
};

export type GuardianSignalModeHarnessResult = {
  caseId: string;
  baseline: GuardianModeBaselineAnchor;
  results: GuardianModeResult[];
  parity: {
    ok: boolean;
    reasons: string[];
  };
};

export type GuardianSignalModeHarnessArtifact = {
  case_id: string;
  baseline_trace_id: string;
  baseline_runtime_mode: string;
  parity_ok: boolean;
  parity_reasons: string[];
  legacy_digest: string;
  shadow_digest: string;
  hybrid_digest: string;
  diffs: {
    shadow_preserves_legacy: boolean;
    hybrid_narrows_legacy: boolean;
    fallback_replays_legacy: boolean;
  };
  expectation_summary: GuardianSignalModeCaseDefinition["expected"];
};

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
  return `{${entries.map(([key, item]) =>
    `${JSON.stringify(key)}:${stableStringify(item)}`
  ).join(",")}}`;
};

const sha256Hex = async (value: unknown): Promise<string> => {
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const loadBaselineAnchor = async (
  traceId: string,
): Promise<GuardianModeBaselineAnchor> => {
  const { traceJson } = goldenTraceArtifactPaths(traceId);
  const parsed = JSON.parse(
    await Deno.readTextFile(traceJson),
  ) as Record<string, unknown>;
  return {
    traceId,
    scenario: String(parsed.scenario ?? traceId),
    runtimeMode: String(parsed.runtime_mode ?? "unknown"),
    tickStart: Number(parsed.tick_start ?? -1),
    tickEnd: Number(parsed.tick_end ?? -1),
    codexSnapshotDigest: String(parsed.codex_snapshot_digest ?? "missing"),
    invariantDigest: String(parsed.invariant_digest ?? "missing"),
  };
};

const scriptForCase = (definition: GuardianSignalModeCaseDefinition): Uint8Array =>
  definition.useGuardianScript
    ? STATE_MATRIX.getGuardianScript()
    : (definition.script ? definition.script : new Uint8Array());

const runMode = (
  definition: GuardianSignalModeCaseDefinition,
  mode: GuardianSignalExecutionMode,
): GuardianModeResult => ({
  mode,
  decision: evaluateGuardianSignalExecution({
    mode,
    script: scriptForCase(definition),
    neuralCoherence: definition.neuralCoherence,
    legacyAllowed: definition.legacyAllowed,
  }),
});

const compareResults = (
  definition: GuardianSignalModeCaseDefinition,
  results: GuardianModeResult[],
): { ok: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  for (const result of results) {
    const expected = definition.expected[result.mode];
    if (result.decision.allowed !== expected.allowed) {
      reasons.push(
        `${result.mode} allowed mismatch expected=${expected.allowed} actual=${result.decision.allowed}`,
      );
    }
    if (result.decision.status !== expected.status) {
      reasons.push(
        `${result.mode} status mismatch expected=${expected.status} actual=${result.decision.status}`,
      );
    }
    if (result.decision.branch !== expected.branch) {
      reasons.push(
        `${result.mode} branch mismatch expected=${expected.branch} actual=${result.decision.branch}`,
      );
    }
    if (result.decision.shadowSuppressed !== expected.shadowSuppressed) {
      reasons.push(
        `${result.mode} shadowSuppressed mismatch expected=${expected.shadowSuppressed} actual=${result.decision.shadowSuppressed}`,
      );
    }
    if (result.decision.hybridSuppressed !== expected.hybridSuppressed) {
      reasons.push(
        `${result.mode} hybridSuppressed mismatch expected=${expected.hybridSuppressed} actual=${result.decision.hybridSuppressed}`,
      );
    }
  }
  return { ok: reasons.length === 0, reasons };
};

const artifactPathForCase = (caseId: string): string =>
  `${HYBRID_DIFF_ROOT}/${caseId}.json`;

const artifactFromResult = async (
  result: GuardianSignalModeHarnessResult,
): Promise<GuardianSignalModeHarnessArtifact> => {
  const legacy = result.results.find((entry) => entry.mode === "legacy-execute");
  const shadow = result.results.find((entry) => entry.mode === "shadow-reduce");
  const hybrid = result.results.find((entry) => entry.mode === "hybrid-reduce");
  if (!legacy || !shadow || !hybrid) {
    throw new Error(
      `[guardian_signal_mode_harness] incomplete mode coverage for case=${result.caseId}`,
    );
  }
  return {
    case_id: result.caseId,
    baseline_trace_id: result.baseline.traceId,
    baseline_runtime_mode: result.baseline.runtimeMode,
    parity_ok: result.parity.ok,
    parity_reasons: result.parity.reasons,
    legacy_digest: await sha256Hex(legacy.decision),
    shadow_digest: await sha256Hex(shadow.decision),
    hybrid_digest: await sha256Hex(hybrid.decision),
    diffs: {
      shadow_preserves_legacy: shadow.decision.allowed === legacy.decision.allowed,
      hybrid_narrows_legacy:
        hybrid.decision.allowed === legacy.decision.allowed ||
        (legacy.decision.allowed && !hybrid.decision.allowed),
      fallback_replays_legacy:
        (shadow.decision.status === "fallback"
          ? shadow.decision.allowed === legacy.decision.allowed
          : true) &&
        (hybrid.decision.status === "fallback"
          ? hybrid.decision.allowed === legacy.decision.allowed
          : true),
    },
    expectation_summary: result.results.reduce((acc, entry) => {
      acc[entry.mode] = result.results.find((candidate) =>
          candidate.mode === entry.mode
        )
        ? guardianSignalModeCaseById(result.caseId)!.expected[entry.mode]
        : acc[entry.mode];
      return acc;
    }, {} as GuardianSignalModeCaseDefinition["expected"]),
  };
};

export const runGuardianSignalModeCase = async (
  caseId: string,
): Promise<GuardianSignalModeHarnessResult> => {
  const definition = guardianSignalModeCaseById(caseId);
  if (!definition) {
    throw new Error(
      `[guardian_signal_mode_harness] unknown case id: ${caseId}`,
    );
  }
  const baseline = await loadBaselineAnchor(definition.baselineTraceId);
  const results: GuardianModeResult[] = [
    runMode(definition, "legacy-execute"),
    runMode(definition, "shadow-reduce"),
    runMode(definition, "hybrid-reduce"),
  ];
  return {
    caseId,
    baseline,
    results,
    parity: compareResults(definition, results),
  };
};

export const runGuardianSignalModeHarness = async (): Promise<
  GuardianSignalModeHarnessResult[]
> => {
  const results: GuardianSignalModeHarnessResult[] = [];
  for (const definition of GUARDIAN_SIGNAL_MODE_CASES) {
    results.push(await runGuardianSignalModeCase(definition.id));
  }
  return results;
};

export const persistGuardianSignalModeHarnessArtifacts = async (
  results: readonly GuardianSignalModeHarnessResult[],
): Promise<string[]> => {
  await Deno.mkdir(HYBRID_DIFF_ROOT, { recursive: true });
  const written: string[] = [];
  for (const result of results) {
    const artifact = await artifactFromResult(result);
    const path = artifactPathForCase(result.caseId);
    await Deno.writeTextFile(path, JSON.stringify(artifact, null, 2) + "\n");
    written.push(path);
  }
  return written;
};

if (import.meta.main) {
  const results = await runGuardianSignalModeHarness();
  const failed = results.filter((result) => !result.parity.ok);
  if (failed.length > 0) {
    console.error("[guardian_signal_mode_harness] parity failure.");
    for (const result of failed) {
      console.error(` - ${result.caseId}`);
      console.error(`   reasons: ${result.parity.reasons.join(" | ")}`);
    }
    Deno.exit(1);
  }
  const written = await persistGuardianSignalModeHarnessArtifacts(results);
  console.log(
    `[guardian_signal_mode_harness] capture complete. cases=${results.length} artifacts=${written.length}`,
  );
}
