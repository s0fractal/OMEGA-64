export const RESILIENCE_SCENARIOS = [
  "worker-timeout-retry",
  "worker-timeout-retry-multi",
  "worker-jitter-resilience",
  "spawn-jitter-resilience",
] as const;

export type ResilienceScenario = (typeof RESILIENCE_SCENARIOS)[number];

const envInt = (key: string, fallback: number): number => {
  const raw = Deno.env.get(key);
  if (!raw || raw.trim().length === 0) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
};

const envFloat = (key: string, fallback: number): number => {
  const raw = Deno.env.get(key);
  if (!raw || raw.trim().length === 0) return fallback;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
};

export type ResilienceBudgetThresholds = {
  scenarioRetriesMax: Record<ResilienceScenario, number>;
  totalRetriesMax: number;
  scenarioDurationMaxMs: Record<ResilienceScenario, number>;
  scenarioDurationTotalMaxMs: number;
  driftAuditDurationMaxMs: number;
  auditDurationTotalMaxMs: number;
};

export const loadResilienceBudgetThresholds =
  (): ResilienceBudgetThresholds => {
    return {
      scenarioRetriesMax: {
        "worker-timeout-retry": envInt(
          "OMEGA_RESILIENCE_RETRIES_MAX_TIMEOUT_SINGLE",
          12,
        ),
        "worker-timeout-retry-multi": envInt(
          "OMEGA_RESILIENCE_RETRIES_MAX_TIMEOUT_MULTI",
          24,
        ),
        "worker-jitter-resilience": envInt(
          "OMEGA_RESILIENCE_RETRIES_MAX_JITTER",
          120,
        ),
        "spawn-jitter-resilience": envInt(
          "OMEGA_RESILIENCE_RETRIES_MAX_SPAWN_JITTER",
          260,
        ),
      },
      totalRetriesMax: envInt("OMEGA_RESILIENCE_RETRIES_MAX_TOTAL", 360),
      scenarioDurationMaxMs: {
        "worker-timeout-retry": envInt(
          "OMEGA_RESILIENCE_DURATION_MAX_TIMEOUT_SINGLE_MS",
          15_000,
        ),
        "worker-timeout-retry-multi": envInt(
          "OMEGA_RESILIENCE_DURATION_MAX_TIMEOUT_MULTI_MS",
          20_000,
        ),
        "worker-jitter-resilience": envInt(
          "OMEGA_RESILIENCE_DURATION_MAX_JITTER_MS",
          25_000,
        ),
        "spawn-jitter-resilience": envInt(
          "OMEGA_RESILIENCE_DURATION_MAX_SPAWN_JITTER_MS",
          35_000,
        ),
      },
      scenarioDurationTotalMaxMs: envInt(
        "OMEGA_RESILIENCE_DURATION_MAX_SCENARIOS_MS",
        75_000,
      ),
      driftAuditDurationMaxMs: envInt(
        "OMEGA_RESILIENCE_DURATION_MAX_DRIFT_AUDIT_MS",
        30_000,
      ),
      auditDurationTotalMaxMs: envInt(
        "OMEGA_RESILIENCE_DURATION_MAX_AUDIT_TOTAL_MS",
        105_000,
      ),
    };
  };

export type ResilienceTrendThresholds = {
  retriesRatioMax: number;
  retriesDeltaMax: number;
  durationRatioMax: number;
  durationDeltaMaxMs: number;
  totalRetriesRatioMax: number;
  totalRetriesDeltaMax: number;
  totalScenarioDurationRatioMax: number;
  totalScenarioDurationDeltaMaxMs: number;
  driftAuditDurationRatioMax: number;
  driftAuditDurationDeltaMaxMs: number;
  totalAuditDurationRatioMax: number;
  totalAuditDurationDeltaMaxMs: number;
};

export const loadResilienceTrendThresholds = (): ResilienceTrendThresholds => {
  return {
    retriesRatioMax: envFloat("OMEGA_RESILIENCE_TREND_RETRIES_RATIO_MAX", 2.2),
    retriesDeltaMax: envFloat("OMEGA_RESILIENCE_TREND_RETRIES_DELTA_MAX", 16),
    durationRatioMax: envFloat("OMEGA_RESILIENCE_TREND_DURATION_RATIO_MAX", 3),
    durationDeltaMaxMs: envFloat(
      "OMEGA_RESILIENCE_TREND_DURATION_DELTA_MAX_MS",
      4_000,
    ),
    totalRetriesRatioMax: envFloat(
      "OMEGA_RESILIENCE_TREND_TOTAL_RETRIES_RATIO_MAX",
      2,
    ),
    totalRetriesDeltaMax: envFloat(
      "OMEGA_RESILIENCE_TREND_TOTAL_RETRIES_DELTA_MAX",
      40,
    ),
    totalScenarioDurationRatioMax: envFloat(
      "OMEGA_RESILIENCE_TREND_TOTAL_SCENARIO_DURATION_RATIO_MAX",
      3,
    ),
    totalScenarioDurationDeltaMaxMs: envFloat(
      "OMEGA_RESILIENCE_TREND_TOTAL_SCENARIO_DURATION_DELTA_MAX_MS",
      8_000,
    ),
    driftAuditDurationRatioMax: envFloat(
      "OMEGA_RESILIENCE_TREND_DRIFT_AUDIT_DURATION_RATIO_MAX",
      3,
    ),
    driftAuditDurationDeltaMaxMs: envFloat(
      "OMEGA_RESILIENCE_TREND_DRIFT_AUDIT_DURATION_DELTA_MAX_MS",
      5_000,
    ),
    totalAuditDurationRatioMax: envFloat(
      "OMEGA_RESILIENCE_TREND_TOTAL_AUDIT_DURATION_RATIO_MAX",
      3,
    ),
    totalAuditDurationDeltaMaxMs: envFloat(
      "OMEGA_RESILIENCE_TREND_TOTAL_AUDIT_DURATION_DELTA_MAX_MS",
      12_000,
    ),
  };
};

export type SoakStabilityConfig = {
  timeoutMs: number;
  retryCount: number;
  retryMs: number;
  jitterMinMs: number;
  jitterMaxMs: number;
  ticks: number;
  sampleEvery: number;
  seed: number;
  replicators: number;
  architects: number;
  backlogMax: number;
  activeMax: number;
  rssSlopeMaxBytes: number;
  heapSlopeMaxBytes: number;
  backlogSlopeMax: number;
  retryRateSlopeMax: number;
  avgTickMsSlopeMax: number;
  avgTickMsP95Max: number;
  avgTickMsSpikeMax: number;
};

export const loadSoakStabilityConfig = (): SoakStabilityConfig => {
  return {
    timeoutMs: envInt("OMEGA_WORKER_RESPONSE_TIMEOUT_MS", 10),
    retryCount: envInt("OMEGA_WORKER_TIMEOUT_RETRY_COUNT", 3),
    retryMs: envInt("OMEGA_WORKER_TIMEOUT_RETRY_MS", 70),
    jitterMinMs: envInt("OMEGA_WORKER_JITTER_MIN_MS", 12),
    jitterMaxMs: envInt("OMEGA_WORKER_JITTER_MAX_MS", 30),
    ticks: envInt("OMEGA_SOAK_STABILITY_TICKS", 320),
    sampleEvery: envInt("OMEGA_SOAK_STABILITY_SAMPLE_EVERY", 20),
    seed: envInt("OMEGA_SOAK_STABILITY_SEED", 424242),
    replicators: envInt("OMEGA_SOAK_STABILITY_REPLICATORS", 8),
    architects: envInt("OMEGA_SOAK_STABILITY_ARCHITECTS", 4),
    backlogMax: envInt("OMEGA_SOAK_BACKLOG_MAX", 64),
    activeMax: envInt("OMEGA_SOAK_ACTIVE_MAX", 5000),
    rssSlopeMaxBytes: envInt("OMEGA_SOAK_RSS_SLOPE_MAX_BYTES", 6_000_000),
    heapSlopeMaxBytes: envInt("OMEGA_SOAK_HEAP_SLOPE_MAX_BYTES", 3_000_000),
    backlogSlopeMax: envFloat("OMEGA_SOAK_BACKLOG_SLOPE_MAX", 4),
    retryRateSlopeMax: envFloat("OMEGA_SOAK_RETRY_RATE_SLOPE_MAX", 0.04),
    avgTickMsSlopeMax: envFloat("OMEGA_SOAK_AVG_TICK_MS_SLOPE_MAX", 2.5),
    avgTickMsP95Max: envFloat("OMEGA_SOAK_AVG_TICK_MS_P95_MAX", 160),
    avgTickMsSpikeMax: envFloat("OMEGA_SOAK_AVG_TICK_MS_SPIKE_MAX", 220),
  };
};

export type SoakTrendThresholds = {
  durationRatioMax: number;
  durationDeltaMaxMs: number;
  p95TickRatioMax: number;
  p95TickDeltaMaxMs: number;
  maxTickRatioMax: number;
  maxTickDeltaMaxMs: number;
  peakActiveRatioMax: number;
  peakActiveDeltaMax: number;
  backlogRatioMax: number;
  backlogDeltaMax: number;
  rssSlopeRatioMax: number;
  rssSlopeDeltaMax: number;
  heapSlopeRatioMax: number;
  heapSlopeDeltaMax: number;
  backlogSlopeRatioMax: number;
  backlogSlopeDeltaMax: number;
  retryRateSlopeRatioMax: number;
  retryRateSlopeDeltaMax: number;
  avgTickSlopeAbsRatioMax: number;
  avgTickSlopeAbsDeltaMax: number;
  retriesRatioMax: number;
  retriesDeltaMax: number;
  timeoutsRatioMax: number;
  timeoutsDeltaMax: number;
  requestsRatioMin: number;
  requestsRatioMax: number;
  requestsDeltaMax: number;
};

export const loadSoakTrendThresholds = (): SoakTrendThresholds => {
  return {
    durationRatioMax: envFloat("OMEGA_SOAK_TREND_DURATION_RATIO_MAX", 1.6),
    durationDeltaMaxMs: envFloat(
      "OMEGA_SOAK_TREND_DURATION_DELTA_MAX_MS",
      18_000,
    ),
    p95TickRatioMax: envFloat("OMEGA_SOAK_TREND_P95_TICK_RATIO_MAX", 1.1),
    p95TickDeltaMaxMs: envFloat("OMEGA_SOAK_TREND_P95_TICK_DELTA_MAX_MS", 6),
    maxTickRatioMax: envFloat("OMEGA_SOAK_TREND_MAX_TICK_RATIO_MAX", 1.35),
    maxTickDeltaMaxMs: envFloat("OMEGA_SOAK_TREND_MAX_TICK_DELTA_MAX_MS", 20),
    peakActiveRatioMax: envFloat("OMEGA_SOAK_TREND_PEAK_ACTIVE_RATIO_MAX", 1.3),
    peakActiveDeltaMax: envFloat("OMEGA_SOAK_TREND_PEAK_ACTIVE_DELTA_MAX", 24),
    backlogRatioMax: envFloat("OMEGA_SOAK_TREND_BACKLOG_RATIO_MAX", 4),
    backlogDeltaMax: envFloat("OMEGA_SOAK_TREND_BACKLOG_DELTA_MAX", 8),
    rssSlopeRatioMax: envFloat("OMEGA_SOAK_TREND_RSS_SLOPE_RATIO_MAX", 4),
    rssSlopeDeltaMax: envFloat(
      "OMEGA_SOAK_TREND_RSS_SLOPE_DELTA_MAX",
      4_000_000,
    ),
    heapSlopeRatioMax: envFloat("OMEGA_SOAK_TREND_HEAP_SLOPE_RATIO_MAX", 6),
    heapSlopeDeltaMax: envFloat(
      "OMEGA_SOAK_TREND_HEAP_SLOPE_DELTA_MAX",
      2_500_000,
    ),
    backlogSlopeRatioMax: envFloat(
      "OMEGA_SOAK_TREND_BACKLOG_SLOPE_RATIO_MAX",
      4,
    ),
    backlogSlopeDeltaMax: envFloat(
      "OMEGA_SOAK_TREND_BACKLOG_SLOPE_DELTA_MAX",
      2,
    ),
    retryRateSlopeRatioMax: envFloat(
      "OMEGA_SOAK_TREND_RETRY_RATE_SLOPE_RATIO_MAX",
      4,
    ),
    retryRateSlopeDeltaMax: envFloat(
      "OMEGA_SOAK_TREND_RETRY_RATE_SLOPE_DELTA_MAX",
      0.02,
    ),
    avgTickSlopeAbsRatioMax: envFloat(
      "OMEGA_SOAK_TREND_AVG_TICK_SLOPE_ABS_RATIO_MAX",
      4,
    ),
    avgTickSlopeAbsDeltaMax: envFloat(
      "OMEGA_SOAK_TREND_AVG_TICK_SLOPE_ABS_DELTA_MAX",
      1.2,
    ),
    retriesRatioMax: envFloat("OMEGA_SOAK_TREND_RETRIES_RATIO_MAX", 1.4),
    retriesDeltaMax: envFloat("OMEGA_SOAK_TREND_RETRIES_DELTA_MAX", 500),
    timeoutsRatioMax: envFloat("OMEGA_SOAK_TREND_TIMEOUTS_RATIO_MAX", 1.4),
    timeoutsDeltaMax: envFloat("OMEGA_SOAK_TREND_TIMEOUTS_DELTA_MAX", 500),
    requestsRatioMin: envFloat("OMEGA_SOAK_TREND_REQUESTS_RATIO_MIN", 0.95),
    requestsRatioMax: envFloat("OMEGA_SOAK_TREND_REQUESTS_RATIO_MAX", 1.2),
    requestsDeltaMax: envFloat("OMEGA_SOAK_TREND_REQUESTS_DELTA_MAX", 500),
  };
};
