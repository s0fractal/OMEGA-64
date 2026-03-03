import { loadResilienceTrendThresholds } from "./worker_gate_thresholds.ts";
import {
  ensurePositive,
  limitByRatioAndDeltaCeil,
} from "./worker_trend_math.ts";

const AUDIT_JSON_PATH = "WORKER_RESILIENCE_AUDIT.json";
const BASELINE_JSON_PATH = "WORKER_RESILIENCE_TREND_BASELINE.json";
const REPORT_JSON_PATH = "WORKER_RESILIENCE_TREND.json";
const REPORT_MD_PATH = "WORKER_RESILIENCE_TREND.md";

type ScenarioMetric = {
  scenario: string;
  totalRetries: number;
  durationMs: number;
};

type AuditReport = {
  generatedAt: string;
  scenarios: Array<{
    scenario: string;
    totalRetries: number;
    totalFailures: number;
    durationMs?: number;
  }>;
  summary: {
    totalRetries: number;
    totalFailures: number;
    totalScenarioDurationMs?: number;
    driftAuditDurationMs?: number;
    totalAuditDurationMs?: number;
    strictHashEqual: boolean;
    nonStrictHashEqual: boolean;
  };
};

type TrendBaseline = {
  generatedAt: string;
  source: string;
  summary: {
    totalRetries: number;
    totalScenarioDurationMs: number;
    driftAuditDurationMs: number;
    totalAuditDurationMs: number;
  };
  scenarios: ScenarioMetric[];
};

type Check = {
  name: string;
  observed: number | boolean;
  limit: number | boolean;
  ok: boolean;
};

const {
  retriesRatioMax,
  retriesDeltaMax,
  durationRatioMax,
  durationDeltaMaxMs,
  totalRetriesRatioMax,
  totalRetriesDeltaMax,
  totalScenarioDurationRatioMax,
  totalScenarioDurationDeltaMaxMs,
  driftAuditDurationRatioMax,
  driftAuditDurationDeltaMaxMs,
  totalAuditDurationRatioMax,
  totalAuditDurationDeltaMaxMs,
} = loadResilienceTrendThresholds();

const baselineFromAudit = (audit: AuditReport): TrendBaseline => ({
  generatedAt: new Date().toISOString(),
  source: "bootstrap-from-current-audit",
  summary: {
    totalRetries: audit.summary.totalRetries,
    totalScenarioDurationMs: ensurePositive(
      audit.summary.totalScenarioDurationMs ?? 0,
      1,
    ),
    driftAuditDurationMs: ensurePositive(
      audit.summary.driftAuditDurationMs ?? 0,
      1,
    ),
    totalAuditDurationMs: ensurePositive(
      audit.summary.totalAuditDurationMs ?? 0,
      1,
    ),
  },
  scenarios: audit.scenarios.map((s) => ({
    scenario: s.scenario,
    totalRetries: s.totalRetries,
    durationMs: ensurePositive(s.durationMs ?? 0, 1),
  })),
});

const renderMd = (
  generatedAt: string,
  baseline: TrendBaseline,
  current: AuditReport,
  checks: Check[],
): string => {
  const rows = checks.map((c) =>
    `| ${c.ok ? "PASS" : "FAIL"} | ${c.name} | ${c.observed} | ${c.limit} |`
  ).join("\n");

  return `# Worker Resilience Trend Report

- generatedAt: ${generatedAt}
- baselineGeneratedAt: ${baseline.generatedAt}
- baselineSource: ${baseline.source}
- currentAuditGeneratedAt: ${current.generatedAt}

| status | check | observed | limit |
|---|---|---:|---:|
${rows}
`;
};

const main = async () => {
  const audit = JSON.parse(
    await Deno.readTextFile(AUDIT_JSON_PATH),
  ) as AuditReport;
  let baseline: TrendBaseline;

  try {
    baseline = JSON.parse(
      await Deno.readTextFile(BASELINE_JSON_PATH),
    ) as TrendBaseline;
  } catch {
    const bootstrap = Deno.env.get("OMEGA_RESILIENCE_TREND_BOOTSTRAP") === "1";
    if (!bootstrap) {
      throw new Error(
        `[TREND] Missing ${BASELINE_JSON_PATH}. Re-run with OMEGA_RESILIENCE_TREND_BOOTSTRAP=1 to generate baseline.`,
      );
    }
    baseline = baselineFromAudit(audit);
    await Deno.writeTextFile(
      BASELINE_JSON_PATH,
      JSON.stringify(baseline, null, 2),
    );
    console.log(`[TREND] Baseline created: ${BASELINE_JSON_PATH}`);
  }

  const checks: Check[] = [];

  checks.push({
    name: "summary.totalFailures == 0",
    observed: audit.summary.totalFailures,
    limit: 0,
    ok: audit.summary.totalFailures === 0,
  });
  checks.push({
    name: "summary.strictHashEqual == true",
    observed: audit.summary.strictHashEqual,
    limit: true,
    ok: audit.summary.strictHashEqual === true,
  });
  checks.push({
    name: "summary.nonStrictHashEqual == true",
    observed: audit.summary.nonStrictHashEqual,
    limit: true,
    ok: audit.summary.nonStrictHashEqual === true,
  });

  const currentTotalScenarioDuration = ensurePositive(
    audit.summary.totalScenarioDurationMs ?? 0,
    1,
  );
  const currentDriftAuditDuration = ensurePositive(
    audit.summary.driftAuditDurationMs ?? 0,
    1,
  );
  const currentTotalAuditDuration = ensurePositive(
    audit.summary.totalAuditDurationMs ?? 0,
    1,
  );

  const totalRetriesLimit = limitByRatioAndDeltaCeil(
    baseline.summary.totalRetries,
    totalRetriesRatioMax,
    totalRetriesDeltaMax,
  );
  checks.push({
    name: "summary.totalRetries trend",
    observed: audit.summary.totalRetries,
    limit: totalRetriesLimit,
    ok: audit.summary.totalRetries <= totalRetriesLimit,
  });

  const totalScenarioDurationLimit = limitByRatioAndDeltaCeil(
    baseline.summary.totalScenarioDurationMs,
    totalScenarioDurationRatioMax,
    totalScenarioDurationDeltaMaxMs,
  );
  checks.push({
    name: "summary.totalScenarioDurationMs trend",
    observed: currentTotalScenarioDuration,
    limit: totalScenarioDurationLimit,
    ok: currentTotalScenarioDuration <= totalScenarioDurationLimit,
  });

  const driftAuditDurationLimit = limitByRatioAndDeltaCeil(
    baseline.summary.driftAuditDurationMs,
    driftAuditDurationRatioMax,
    driftAuditDurationDeltaMaxMs,
  );
  checks.push({
    name: "summary.driftAuditDurationMs trend",
    observed: currentDriftAuditDuration,
    limit: driftAuditDurationLimit,
    ok: currentDriftAuditDuration <= driftAuditDurationLimit,
  });

  const totalAuditDurationLimit = limitByRatioAndDeltaCeil(
    baseline.summary.totalAuditDurationMs,
    totalAuditDurationRatioMax,
    totalAuditDurationDeltaMaxMs,
  );
  checks.push({
    name: "summary.totalAuditDurationMs trend",
    observed: currentTotalAuditDuration,
    limit: totalAuditDurationLimit,
    ok: currentTotalAuditDuration <= totalAuditDurationLimit,
  });

  const currentByScenario = new Map(
    audit.scenarios.map((s) => [s.scenario, s]),
  );
  for (const b of baseline.scenarios) {
    const current = currentByScenario.get(b.scenario);
    if (!current) {
      checks.push({
        name: `scenario.${b.scenario} present`,
        observed: false,
        limit: true,
        ok: false,
      });
      continue;
    }

    checks.push({
      name: `scenario.${b.scenario}.totalFailures == 0`,
      observed: current.totalFailures,
      limit: 0,
      ok: current.totalFailures === 0,
    });

    const retriesLimit = limitByRatioAndDeltaCeil(
      b.totalRetries,
      retriesRatioMax,
      retriesDeltaMax,
    );
    checks.push({
      name: `scenario.${b.scenario}.totalRetries trend`,
      observed: current.totalRetries,
      limit: retriesLimit,
      ok: current.totalRetries <= retriesLimit,
    });

    const currentDuration = ensurePositive(current.durationMs ?? 0, 1);
    const durationLimit = limitByRatioAndDeltaCeil(
      b.durationMs,
      durationRatioMax,
      durationDeltaMaxMs,
    );
    checks.push({
      name: `scenario.${b.scenario}.durationMs trend`,
      observed: currentDuration,
      limit: durationLimit,
      ok: currentDuration <= durationLimit,
    });
  }

  const failing = checks.filter((c) => !c.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    baseline,
    currentSummary: audit.summary,
    thresholds: {
      retriesRatioMax,
      retriesDeltaMax,
      durationRatioMax,
      durationDeltaMaxMs,
      totalRetriesRatioMax,
      totalRetriesDeltaMax,
      totalScenarioDurationRatioMax,
      totalScenarioDurationDeltaMaxMs,
      driftAuditDurationRatioMax,
      driftAuditDurationDeltaMaxMs,
      totalAuditDurationRatioMax,
      totalAuditDurationDeltaMaxMs,
    },
    checks,
    pass: failing.length === 0,
  };

  await Deno.writeTextFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2));
  await Deno.writeTextFile(
    REPORT_MD_PATH,
    renderMd(report.generatedAt, baseline, audit, checks),
  );

  console.log(`AUDIT [worker-resilience-trend] report: ${REPORT_JSON_PATH}`);
  console.log(`AUDIT [worker-resilience-trend] reportMd: ${REPORT_MD_PATH}`);
  console.log(`   checks=${checks.length} failed=${failing.length}`);

  if (failing.length > 0) {
    for (const f of failing) {
      console.error(
        `   FAIL ${f.name} observed=${f.observed} limit=${f.limit}`,
      );
    }
    throw new Error("[AUDIT] Worker resilience trend gate failed.");
  }

  console.log("✅ [AUDIT] Worker resilience trend gate passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
