---
id: REPLICATION_PROMOTION_DECISION
type: pure_fn
description: "Evaluates promotion conditions for Replication loops in hybrid shadow reduction."
tags: ["core", "control", "host"]
min_level: 6

---
```typescript
export type ReplicationPromotionDecisionInput = {
  promotion: {
    latestReady: boolean;
    readyRatio: number;
    recommendedMode: "legacy-execute" | "hybrid-reduce" | "shadow-reduce";
    fallbackRatioP95: number;
    status: string;
  };
  health: {
    bootReady: boolean;
    processExitedUnexpectedly: boolean;
    successRate: number;
    minSuccessRate: number;
    p95TelemetryLatencyMs: number;
    maxP95TelemetryLatencyMs: number;
    p95SpatialOverflowRatio: number;
    maxSpatialOverflowRatioP95: number;
    safeModeRatio?: number;
    maxSafeModeRatio?: number;
    enforceActionQualityGate?: boolean;
  };
};

export type ReplicationPromotionDecisionThresholds = {
  minReadyRatio: number;
  maxFallbackRatioP95: number;
};

export type ReplicationPromotionDecision = {
  verdict: "promote" | "hold";
  promotionReady: boolean;
  healthPass: boolean;
  recommendedMode: "hybrid-reduce" | "shadow-reduce";
  blockers: string[];
  thresholds: ReplicationPromotionDecisionThresholds;
};

const DEFAULT_THRESHOLDS: ReplicationPromotionDecisionThresholds = {
  minReadyRatio: 0.5,
  maxFallbackRatioP95: 0.05,
};

const clampRatio = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return Number(value.toFixed(6));
};

const normalizeThresholds = (
  overrides?: Partial<ReplicationPromotionDecisionThresholds>,
): ReplicationPromotionDecisionThresholds => ({
  minReadyRatio: clampRatio(
    overrides?.minReadyRatio ?? DEFAULT_THRESHOLDS.minReadyRatio,
  ),
  maxFallbackRatioP95: clampRatio(
    overrides?.maxFallbackRatioP95 ?? DEFAULT_THRESHOLDS.maxFallbackRatioP95,
  ),
});

export const evaluateReplicationPromotionDecision = (
  input: ReplicationPromotionDecisionInput,
  overrides?: Partial<ReplicationPromotionDecisionThresholds>,
): ReplicationPromotionDecision => {
  const thresholds = normalizeThresholds(overrides);
  const blockers: string[] = [];
  let healthPass = true;

  if (!input.health.bootReady) {
    blockers.push("boot_not_ready");
    healthPass = false;
  }
  if (input.health.processExitedUnexpectedly) {
    blockers.push("process_exited_unexpectedly");
    healthPass = false;
  }
  if (input.health.successRate < input.health.minSuccessRate) {
    blockers.push(
      `success_rate_${input.health.successRate.toFixed(3)}_lt_${
        input.health.minSuccessRate.toFixed(3)
      }`,
    );
    healthPass = false;
  }
  if (
    input.health.p95TelemetryLatencyMs > input.health.maxP95TelemetryLatencyMs
  ) {
    blockers.push(
      `telemetry_latency_${input.health.p95TelemetryLatencyMs.toFixed(3)}_gt_${
        input.health.maxP95TelemetryLatencyMs.toFixed(3)
      }`,
    );
    healthPass = false;
  }
  if (
    input.health.p95SpatialOverflowRatio >
      input.health.maxSpatialOverflowRatioP95
  ) {
    blockers.push(
      `overflow_ratio_${input.health.p95SpatialOverflowRatio.toFixed(6)}_gt_${
        input.health.maxSpatialOverflowRatioP95.toFixed(6)
      }`,
    );
    healthPass = false;
  }

  if (!input.promotion.latestReady) {
    blockers.push(`promotion_latest_not_ready(${input.promotion.status})`);
  }
  if (clampRatio(input.promotion.readyRatio) < thresholds.minReadyRatio) {
    blockers.push(
      `promotion_ready_ratio_${
        clampRatio(input.promotion.readyRatio).toFixed(3)
      }_lt_${thresholds.minReadyRatio.toFixed(3)}`,
    );
  }
  if (input.promotion.recommendedMode !== "hybrid-reduce") {
    blockers.push(
      `promotion_mode_${input.promotion.recommendedMode}_not_hybrid_reduce`,
    );
  }
  if (
    clampRatio(input.promotion.fallbackRatioP95) >
      thresholds.maxFallbackRatioP95
  ) {
    blockers.push(
      `promotion_fallback_ratio_p95_${
        clampRatio(input.promotion.fallbackRatioP95).toFixed(6)
      }_gt_${thresholds.maxFallbackRatioP95.toFixed(6)}`,
    );
  }

  if (input.health.enforceActionQualityGate === true) {
    if (
      input.health.maxSafeModeRatio !== undefined &&
      input.health.safeModeRatio !== undefined &&
      clampRatio(input.health.safeModeRatio) >
        clampRatio(input.health.maxSafeModeRatio)
    ) {
      blockers.push(
        `safe_mode_ratio_${
          clampRatio(input.health.safeModeRatio).toFixed(3)
        }_gt_${clampRatio(input.health.maxSafeModeRatio).toFixed(3)}`,
      );
      healthPass = false;
    }
  }

  return {
    verdict: blockers.length === 0 ? "promote" : "hold",
    promotionReady: input.promotion.latestReady,
    healthPass,
    recommendedMode: blockers.length === 0 ? "hybrid-reduce" : "shadow-reduce",
    blockers,
    thresholds,
  };
};

export const REPLICATION_PROMOTION_DECISION = {
  evaluateReplicationPromotionDecision
};
```
