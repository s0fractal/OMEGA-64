import { evaluateGuardianSignalPromotionDecision } from "./GUARDIAN_SIGNAL_PROMOTION_DECISION.ts";

type Failure = {
  name: string;
  reason: string;
};

const failures: Failure[] = [];

const expect = (condition: boolean, name: string, reason: string) => {
  if (!condition) failures.push({ name, reason });
};

const promote = evaluateGuardianSignalPromotionDecision({
  promotion: {
    latestReady: true,
    readyRatio: 0.75,
    recommendedMode: "hybrid-reduce",
    fallbackRatioP95: 0.02,
    status: "ready",
  },
  health: {
    bootReady: true,
    processExitedUnexpectedly: false,
    successRate: 0.99,
    minSuccessRate: 0.9,
    p95TelemetryLatencyMs: 120,
    maxP95TelemetryLatencyMs: 700,
    p95SpatialOverflowRatio: 0.04,
    maxSpatialOverflowRatioP95: 0.1,
  },
});
expect(
  promote.verdict === "promote" &&
    promote.recommendedMode === "hybrid-reduce" &&
    promote.blockers.length === 0,
  "promote",
  "Healthy run with ready promotion state must emit a promote verdict.",
);

const holdPromotion = evaluateGuardianSignalPromotionDecision({
  promotion: {
    latestReady: false,
    readyRatio: 0.25,
    recommendedMode: "shadow-reduce",
    fallbackRatioP95: 0.02,
    status: "warming",
  },
  health: {
    bootReady: true,
    processExitedUnexpectedly: false,
    successRate: 0.99,
    minSuccessRate: 0.9,
    p95TelemetryLatencyMs: 120,
    maxP95TelemetryLatencyMs: 700,
    p95SpatialOverflowRatio: 0.04,
    maxSpatialOverflowRatioP95: 0.1,
  },
});
expect(
  holdPromotion.verdict === "hold" &&
    holdPromotion.blockers.some((x) =>
      x.startsWith("promotion_latest_not_ready")
    ),
  "hold-promotion",
  "Unready promotion state must keep the verdict on hold.",
);

const holdHealth = evaluateGuardianSignalPromotionDecision({
  promotion: {
    latestReady: true,
    readyRatio: 0.8,
    recommendedMode: "hybrid-reduce",
    fallbackRatioP95: 0.01,
    status: "ready",
  },
  health: {
    bootReady: true,
    processExitedUnexpectedly: false,
    successRate: 0.72,
    minSuccessRate: 0.9,
    p95TelemetryLatencyMs: 120,
    maxP95TelemetryLatencyMs: 700,
    p95SpatialOverflowRatio: 0.04,
    maxSpatialOverflowRatioP95: 0.1,
  },
});
expect(
  holdHealth.verdict === "hold" &&
    holdHealth.blockers.some((x) => x.startsWith("success_rate_")),
  "hold-health",
  "Promotion-ready slit must still hold when the enclosing canary health is weak.",
);

const holdDaemon = evaluateGuardianSignalPromotionDecision({
  promotion: {
    latestReady: true,
    readyRatio: 0.7,
    recommendedMode: "hybrid-reduce",
    fallbackRatioP95: 0.01,
    status: "ready",
  },
  health: {
    bootReady: true,
    processExitedUnexpectedly: false,
    successRate: 0.98,
    minSuccessRate: 0.9,
    p95TelemetryLatencyMs: 140,
    maxP95TelemetryLatencyMs: 700,
    p95SpatialOverflowRatio: 0.08,
    maxSpatialOverflowRatioP95: 0.2,
    safeModeRatio: 0.2,
    maxSafeModeRatio: 0.5,
    daemonRejectRatio: 0.4,
    maxDaemonRejectRatio: 0.2,
    effectEvalCoverage: 0.8,
    minEffectEvalCoverage: 0.3,
    enforceActionQualityGate: true,
  },
});
expect(
  holdDaemon.verdict === "hold" &&
    holdDaemon.blockers.some((x) => x.startsWith("daemon_reject_ratio_")),
  "hold-daemon",
  "Daemon-specific governance health must also be able to block promotion.",
);

if (failures.length > 0) {
  console.error("[guardian-signal-promotion-decision] contract violated.");
  for (const failure of failures) {
    console.error(` - ${failure.name}`);
    console.error(`   reason: ${failure.reason}`);
  }
  Deno.exit(1);
}

console.log("[guardian-signal-promotion-decision] contract guard passed.");
