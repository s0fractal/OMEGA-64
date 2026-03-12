import { loadSoakTrendThresholds } from "./worker_gate_thresholds.ts";
import { loadTrendBaselineWithBootstrap } from "./worker_trend_baseline.ts";
import { limitByRatioAndDelta, minByRatio } from "./worker_trend_math.ts";

const SOAK_JSON_PATH = "WORKER_SOAK_STABILITY.json";
const BASELINE_JSON_PATH = "WORKER_SOAK_STABILITY_BASELINE.json";
const REPORT_JSON_PATH = "WORKER_SOAK_TREND.json";
const REPORT_MD_PATH = "WORKER_SOAK_TREND.md";

type SoakSummary = {
  ticks: number;
  sampleEvery: number;
  samples: number;
  totalDurationMs: number;
  initialActive: number;
  finalActive: number;
  peakActive: number;
  maxBacklog: number;
  p95WindowAvgTickMs?: number;
  maxWindowAvgTickMs: number;
  slopes: {
    rss: number;
    heapUsed: number;
    backlog: number;
    retryRate: number;
    avgTickMs: number;
  };
  totals: {
    requests: number;
    retries: number;
    timeouts: number;
    failures: number;
  };
};

type SoakReport = {
  generatedAt: string;
  summary: SoakSummary;
  pass: boolean;
};

type SoakTrendBaseline = {
  generatedAt: string;
  source: string;
  summary: {
    ticks: number;
    sampleEvery: number;
    samples: number;
    totalDurationMs: number;
    peakActive: number;
    maxBacklog: number;
    p95WindowAvgTickMs: number;
    maxWindowAvgTickMs: number;
    slopes: {
      rss: number;
      heapUsed: number;
      backlog: number;
      retryRate: number;
      avgTickMsAbs: number;
    };
    totals: {
      requests: number;
      retries: number;
      timeouts: number;
      failures: number;
    };
  };
};

type Check = {
  name: string;
  observed: number | boolean;
  limit: number | boolean;
  ok: boolean;
};

const {
  durationRatioMax,
  durationDeltaMaxMs,
  p95TickRatioMax,
  p95TickDeltaMaxMs,
  maxTickRatioMax,
  maxTickDeltaMaxMs,
  peakActiveRatioMax,
  peakActiveDeltaMax,
  backlogRatioMax,
  backlogDeltaMax,
  rssSlopeRatioMax,
  rssSlopeDeltaMax,
  heapSlopeRatioMax,
  heapSlopeDeltaMax,
  backlogSlopeRatioMax,
  backlogSlopeDeltaMax,
  retryRateSlopeRatioMax,
  retryRateSlopeDeltaMax,
  avgTickSlopeAbsRatioMax,
  avgTickSlopeAbsDeltaMax,
  retriesRatioMax,
  retriesDeltaMax,
  timeoutsRatioMax,
  timeoutsDeltaMax,
  requestsRatioMin,
  requestsRatioMax,
  requestsDeltaMax,
} = loadSoakTrendThresholds();

const baselineFromReport = (report: SoakReport): SoakTrendBaseline => ({
  generatedAt: new Date().toISOString(),
  source: "bootstrap-from-current-soak-report",
  summary: {
    ticks: report.summary.ticks,
    sampleEvery: report.summary.sampleEvery,
    samples: report.summary.samples,
    totalDurationMs: report.summary.totalDurationMs,
    peakActive: report.summary.peakActive,
    maxBacklog: report.summary.maxBacklog,
    p95WindowAvgTickMs: report.summary.p95WindowAvgTickMs ??
      report.summary.maxWindowAvgTickMs,
    maxWindowAvgTickMs: report.summary.maxWindowAvgTickMs,
    slopes: {
      rss: report.summary.slopes.rss,
      heapUsed: report.summary.slopes.heapUsed,
      backlog: report.summary.slopes.backlog,
      retryRate: report.summary.slopes.retryRate,
      avgTickMsAbs: Math.abs(report.summary.slopes.avgTickMs),
    },
    totals: {
      requests: report.summary.totals.requests,
      retries: report.summary.totals.retries,
      timeouts: report.summary.totals.timeouts,
      failures: report.summary.totals.failures,
    },
  },
});

const renderMd = (
  generatedAt: string,
  baseline: SoakTrendBaseline,
  current: SoakReport,
  checks: Check[],
): string => {
  const rows = checks
    .map((c) =>
      `| ${c.ok ? "PASS" : "FAIL"} | ${c.name} | ${c.observed} | ${c.limit} |`
    )
    .join("\n");

  return `# Worker Soak Trend Report

- generatedAt: ${generatedAt}
- baselineGeneratedAt: ${baseline.generatedAt}
- baselineSource: ${baseline.source}
- currentReportGeneratedAt: ${current.generatedAt}

| status | check | observed | limit |
|---|---|---:|---:|
${rows}
`;
};

const main = async () => {
  const current = JSON.parse(
    await Deno.readTextFile(SOAK_JSON_PATH),
  ) as SoakReport;

  const baseline = await loadTrendBaselineWithBootstrap<
    SoakReport,
    SoakTrendBaseline
  >({
    baselinePath: BASELINE_JSON_PATH,
    bootstrapEnv: "OMEGA_SOAK_TREND_BOOTSTRAP",
    current,
    baselineFromCurrent: baselineFromReport,
    missingErrorMessage: (path, envVar) =>
      `[SOAK-TREND] Missing ${path}. Re-run with ${envVar}=1 to generate baseline.`,
    createdLogMessage: (path) => `[SOAK-TREND] Baseline created: ${path}`,
  });

  const checks: Check[] = [];
  checks.push({
    name: "current.pass == true",
    observed: current.pass,
    limit: true,
    ok: current.pass === true,
  });
  checks.push({
    name: "summary.totals.failures == 0",
    observed: current.summary.totals.failures,
    limit: 0,
    ok: current.summary.totals.failures === 0,
  });
  checks.push({
    name: "summary.ticks == baseline.ticks",
    observed: current.summary.ticks,
    limit: baseline.summary.ticks,
    ok: current.summary.ticks === baseline.summary.ticks,
  });
  checks.push({
    name: "summary.sampleEvery == baseline.sampleEvery",
    observed: current.summary.sampleEvery,
    limit: baseline.summary.sampleEvery,
    ok: current.summary.sampleEvery === baseline.summary.sampleEvery,
  });
  checks.push({
    name: "summary.samples >= baseline.samples",
    observed: current.summary.samples,
    limit: baseline.summary.samples,
    ok: current.summary.samples >= baseline.summary.samples,
  });

  const durationLimit = limitByRatioAndDelta(
    baseline.summary.totalDurationMs,
    durationRatioMax,
    durationDeltaMaxMs,
  );
  checks.push({
    name: "summary.totalDurationMs trend",
    observed: current.summary.totalDurationMs,
    limit: Math.round(durationLimit),
    ok: current.summary.totalDurationMs <= durationLimit,
  });

  const currentP95Tick = current.summary.p95WindowAvgTickMs ??
    current.summary.maxWindowAvgTickMs;
  const baselineP95Tick = baseline.summary.p95WindowAvgTickMs ??
    baseline.summary.maxWindowAvgTickMs;
  const p95WindowAvgTickMsLimit = limitByRatioAndDelta(
    baselineP95Tick,
    p95TickRatioMax,
    p95TickDeltaMaxMs,
  );
  checks.push({
    name: "summary.p95WindowAvgTickMs trend",
    observed: Number(currentP95Tick.toFixed(3)),
    limit: Number(p95WindowAvgTickMsLimit.toFixed(3)),
    ok: currentP95Tick <= p95WindowAvgTickMsLimit,
  });

  const maxWindowAvgTickMsLimit = limitByRatioAndDelta(
    baseline.summary.maxWindowAvgTickMs,
    maxTickRatioMax,
    maxTickDeltaMaxMs,
  );
  checks.push({
    name: "summary.maxWindowAvgTickMs trend",
    observed: Number(current.summary.maxWindowAvgTickMs.toFixed(3)),
    limit: Number(maxWindowAvgTickMsLimit.toFixed(3)),
    ok: current.summary.maxWindowAvgTickMs <= maxWindowAvgTickMsLimit,
  });

  const peakActiveLimit = limitByRatioAndDelta(
    baseline.summary.peakActive,
    peakActiveRatioMax,
    peakActiveDeltaMax,
  );
  checks.push({
    name: "summary.peakActive trend",
    observed: current.summary.peakActive,
    limit: Math.round(peakActiveLimit),
    ok: current.summary.peakActive <= peakActiveLimit,
  });

  const maxBacklogLimit = limitByRatioAndDelta(
    baseline.summary.maxBacklog,
    backlogRatioMax,
    backlogDeltaMax,
  );
  checks.push({
    name: "summary.maxBacklog trend",
    observed: current.summary.maxBacklog,
    limit: Math.round(maxBacklogLimit),
    ok: current.summary.maxBacklog <= maxBacklogLimit,
  });

  const rssSlopeLimit = limitByRatioAndDelta(
    baseline.summary.slopes.rss,
    rssSlopeRatioMax,
    rssSlopeDeltaMax,
  );
  checks.push({
    name: "summary.slopes.rss trend",
    observed: Math.round(current.summary.slopes.rss),
    limit: Math.round(rssSlopeLimit),
    ok: current.summary.slopes.rss <= rssSlopeLimit,
  });

  const heapSlopeLimit = limitByRatioAndDelta(
    baseline.summary.slopes.heapUsed,
    heapSlopeRatioMax,
    heapSlopeDeltaMax,
  );
  checks.push({
    name: "summary.slopes.heapUsed trend",
    observed: Math.round(current.summary.slopes.heapUsed),
    limit: Math.round(heapSlopeLimit),
    ok: current.summary.slopes.heapUsed <= heapSlopeLimit,
  });

  const backlogSlopeLimit = limitByRatioAndDelta(
    baseline.summary.slopes.backlog,
    backlogSlopeRatioMax,
    backlogSlopeDeltaMax,
  );
  checks.push({
    name: "summary.slopes.backlog trend",
    observed: Number(current.summary.slopes.backlog.toFixed(6)),
    limit: Number(backlogSlopeLimit.toFixed(6)),
    ok: current.summary.slopes.backlog <= backlogSlopeLimit,
  });

  const retryRateSlopeLimit = limitByRatioAndDelta(
    baseline.summary.slopes.retryRate,
    retryRateSlopeRatioMax,
    retryRateSlopeDeltaMax,
  );
  checks.push({
    name: "summary.slopes.retryRate trend",
    observed: Number(current.summary.slopes.retryRate.toFixed(8)),
    limit: Number(retryRateSlopeLimit.toFixed(8)),
    ok: current.summary.slopes.retryRate <= retryRateSlopeLimit,
  });

  const currentAvgTickSlopeAbs = Math.abs(current.summary.slopes.avgTickMs);
  const avgTickSlopeAbsLimit = limitByRatioAndDelta(
    baseline.summary.slopes.avgTickMsAbs,
    avgTickSlopeAbsRatioMax,
    avgTickSlopeAbsDeltaMax,
  );
  checks.push({
    name: "summary.slopes.avgTickMs abs trend",
    observed: Number(currentAvgTickSlopeAbs.toFixed(8)),
    limit: Number(avgTickSlopeAbsLimit.toFixed(8)),
    ok: currentAvgTickSlopeAbs <= avgTickSlopeAbsLimit,
  });

  const retriesLimit = limitByRatioAndDelta(
    baseline.summary.totals.retries,
    retriesRatioMax,
    retriesDeltaMax,
  );
  checks.push({
    name: "summary.totals.retries trend",
    observed: current.summary.totals.retries,
    limit: Math.round(retriesLimit),
    ok: current.summary.totals.retries <= retriesLimit,
  });

  const timeoutsLimit = limitByRatioAndDelta(
    baseline.summary.totals.timeouts,
    timeoutsRatioMax,
    timeoutsDeltaMax,
  );
  checks.push({
    name: "summary.totals.timeouts trend",
    observed: current.summary.totals.timeouts,
    limit: Math.round(timeoutsLimit),
    ok: current.summary.totals.timeouts <= timeoutsLimit,
  });

  const minRequests = minByRatio(
    baseline.summary.totals.requests,
    requestsRatioMin,
  );
  const maxRequests = limitByRatioAndDelta(
    baseline.summary.totals.requests,
    requestsRatioMax,
    requestsDeltaMax,
  );
  checks.push({
    name: "summary.totals.requests min trend",
    observed: current.summary.totals.requests,
    limit: Math.round(minRequests),
    ok: current.summary.totals.requests >= minRequests,
  });
  checks.push({
    name: "summary.totals.requests max trend",
    observed: current.summary.totals.requests,
    limit: Math.round(maxRequests),
    ok: current.summary.totals.requests <= maxRequests,
  });

  const failing = checks.filter((c) => !c.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    baseline,
    currentSummary: current.summary,
    thresholds: {
      durationRatioMax,
      durationDeltaMaxMs,
      p95TickRatioMax,
      p95TickDeltaMaxMs,
      maxTickRatioMax,
      maxTickDeltaMaxMs,
      peakActiveRatioMax,
      peakActiveDeltaMax,
      backlogRatioMax,
      backlogDeltaMax,
      rssSlopeRatioMax,
      rssSlopeDeltaMax,
      heapSlopeRatioMax,
      heapSlopeDeltaMax,
      backlogSlopeRatioMax,
      backlogSlopeDeltaMax,
      retryRateSlopeRatioMax,
      retryRateSlopeDeltaMax,
      avgTickSlopeAbsRatioMax,
      avgTickSlopeAbsDeltaMax,
      retriesRatioMax,
      retriesDeltaMax,
      timeoutsRatioMax,
      timeoutsDeltaMax,
      requestsRatioMin,
      requestsRatioMax,
      requestsDeltaMax,
    },
    checks,
    pass: failing.length === 0,
  };

  await Deno.writeTextFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2));
  await Deno.writeTextFile(
    REPORT_MD_PATH,
    renderMd(report.generatedAt, baseline, current, checks),
  );

  console.log(`AUDIT [worker-soak-trend] report: ${REPORT_JSON_PATH}`);
  console.log(`AUDIT [worker-soak-trend] reportMd: ${REPORT_MD_PATH}`);
  console.log(`   checks=${checks.length} failed=${failing.length}`);

  if (failing.length > 0) {
    for (const f of failing) {
      console.error(
        `   FAIL ${f.name} observed=${f.observed} limit=${f.limit}`,
      );
    }
    throw new Error("[AUDIT] Worker soak trend gate failed.");
  }

  console.log("✅ [AUDIT] Worker soak trend gate passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
