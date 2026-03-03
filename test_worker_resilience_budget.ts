const AUDIT_JSON_PATH = "WORKER_RESILIENCE_AUDIT.json";
const REPORT_JSON_PATH = "WORKER_RESILIENCE_BUDGET.json";
const REPORT_MD_PATH = "WORKER_RESILIENCE_BUDGET.md";

type ScenarioCapture = {
  scenario: string;
  totalRetries: number;
  totalFailures: number;
};

type DriftMetrics = {
  hashEqual: boolean;
  maxPosDrift: number;
  atomDiffCount: number;
  structureDiffCount: number;
  signalDiffCount: number;
};

type AuditReport = {
  generatedAt: string;
  scenarios: ScenarioCapture[];
  drift: {
    strict: { metrics: DriftMetrics };
    nonStrict: { metrics: DriftMetrics };
  };
  summary: {
    totalRetries: number;
    totalFailures: number;
    strictHashEqual: boolean;
    nonStrictHashEqual: boolean;
    nonStrictMaxPosDrift: number;
  };
};

type BudgetCheck = {
  name: string;
  observed: number | boolean;
  limit: number | boolean;
  ok: boolean;
};

const envNum = (key: string, fallback: number): number => {
  const raw = Deno.env.get(key);
  if (raw == null || raw.trim().length === 0) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
};

const scenarioBudget = {
  "worker-timeout-retry": envNum(
    "OMEGA_RESILIENCE_RETRIES_MAX_TIMEOUT_SINGLE",
    12,
  ),
  "worker-timeout-retry-multi": envNum(
    "OMEGA_RESILIENCE_RETRIES_MAX_TIMEOUT_MULTI",
    24,
  ),
  "worker-jitter-resilience": envNum(
    "OMEGA_RESILIENCE_RETRIES_MAX_JITTER",
    120,
  ),
  "spawn-jitter-resilience": envNum(
    "OMEGA_RESILIENCE_RETRIES_MAX_SPAWN_JITTER",
    260,
  ),
} as const;

const totalRetriesMax = envNum("OMEGA_RESILIENCE_RETRIES_MAX_TOTAL", 360);

const toChecks = (audit: AuditReport): BudgetCheck[] => {
  const byScenario = new Map(audit.scenarios.map((s) => [s.scenario, s]));
  const checks: BudgetCheck[] = [
    {
      name: "summary.totalFailures == 0",
      observed: audit.summary.totalFailures,
      limit: 0,
      ok: audit.summary.totalFailures === 0,
    },
    {
      name: "summary.strictHashEqual == true",
      observed: audit.summary.strictHashEqual,
      limit: true,
      ok: audit.summary.strictHashEqual === true,
    },
    {
      name: "summary.nonStrictHashEqual == true",
      observed: audit.summary.nonStrictHashEqual,
      limit: true,
      ok: audit.summary.nonStrictHashEqual === true,
    },
    {
      name: `summary.totalRetries <= ${totalRetriesMax}`,
      observed: audit.summary.totalRetries,
      limit: totalRetriesMax,
      ok: audit.summary.totalRetries <= totalRetriesMax,
    },
    {
      name: "drift.nonStrict.maxPosDrift == 0",
      observed: audit.drift.nonStrict.metrics.maxPosDrift,
      limit: 0,
      ok: audit.drift.nonStrict.metrics.maxPosDrift === 0,
    },
    {
      name: "drift.nonStrict.atomDiffCount == 0",
      observed: audit.drift.nonStrict.metrics.atomDiffCount,
      limit: 0,
      ok: audit.drift.nonStrict.metrics.atomDiffCount === 0,
    },
    {
      name: "drift.nonStrict.structureDiffCount == 0",
      observed: audit.drift.nonStrict.metrics.structureDiffCount,
      limit: 0,
      ok: audit.drift.nonStrict.metrics.structureDiffCount === 0,
    },
    {
      name: "drift.nonStrict.signalDiffCount == 0",
      observed: audit.drift.nonStrict.metrics.signalDiffCount,
      limit: 0,
      ok: audit.drift.nonStrict.metrics.signalDiffCount === 0,
    },
  ];

  for (const [scenario, maxRetries] of Object.entries(scenarioBudget)) {
    const capture = byScenario.get(scenario);
    if (!capture) {
      checks.push({
        name: `scenario.${scenario} present`,
        observed: false,
        limit: true,
        ok: false,
      });
      continue;
    }
    checks.push({
      name: `scenario.${scenario}.totalFailures == 0`,
      observed: capture.totalFailures,
      limit: 0,
      ok: capture.totalFailures === 0,
    });
    checks.push({
      name: `scenario.${scenario}.totalRetries <= ${maxRetries}`,
      observed: capture.totalRetries,
      limit: maxRetries,
      ok: capture.totalRetries <= maxRetries,
    });
  }

  return checks;
};

const renderMarkdown = (
  generatedAt: string,
  audit: AuditReport,
  checks: BudgetCheck[],
): string => {
  const rows = checks
    .map((c) =>
      `| ${c.ok ? "PASS" : "FAIL"} | ${c.name} | ${c.observed} | ${c.limit} |`
    )
    .join("\n");

  return `# Worker Resilience Budget Report

- generatedAt: ${generatedAt}
- auditGeneratedAt: ${audit.generatedAt}
- summary.totalRetries: ${audit.summary.totalRetries}
- summary.totalFailures: ${audit.summary.totalFailures}

| status | check | observed | limit |
|---|---|---:|---:|
${rows}
`;
};

const main = async () => {
  const raw = await Deno.readTextFile(AUDIT_JSON_PATH);
  const audit = JSON.parse(raw) as AuditReport;

  const checks = toChecks(audit);
  const failing = checks.filter((c) => !c.ok);

  const report = {
    generatedAt: new Date().toISOString(),
    auditGeneratedAt: audit.generatedAt,
    pass: failing.length === 0,
    summary: audit.summary,
    scenarioBudget,
    totalRetriesMax,
    checks,
  };

  await Deno.writeTextFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2));
  await Deno.writeTextFile(
    REPORT_MD_PATH,
    renderMarkdown(report.generatedAt, audit, checks),
  );

  console.log(`AUDIT [worker-resilience-budget] report: ${REPORT_JSON_PATH}`);
  console.log(`AUDIT [worker-resilience-budget] reportMd: ${REPORT_MD_PATH}`);
  console.log(`   checks=${checks.length} failed=${failing.length}`);

  if (failing.length > 0) {
    for (const f of failing) {
      console.error(
        `   FAIL ${f.name} observed=${f.observed} limit=${f.limit}`,
      );
    }
    throw new Error("[AUDIT] Worker resilience budget gate failed.");
  }

  console.log("✅ [AUDIT] Worker resilience budget gate passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
