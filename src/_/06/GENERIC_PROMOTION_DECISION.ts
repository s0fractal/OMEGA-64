// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/generic_promotion_decision.md

export type GenericPromotionDecisionInput = {
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
    daemonRejectRatio?: number;
    maxDaemonRejectRatio?: number;
    effectEvalCoverage?: number;
    minEffectEvalCoverage?: number;
    enforceActionQualityGate?: boolean;
  };
};

export type GenericPromotionDecisionThresholds = {
  minReadyRatio: number;
  maxFallbackRatioP95: number;
};

export type GenericPromotionDecision = {
  verdict: "promote" | "hold";
  promotionReady: boolean;
  healthPass: boolean;
  recommendedMode: "hybrid-reduce" | "shadow-reduce";
  blockers: string[];
  thresholds: GenericPromotionDecisionThresholds;
};

const DEFAULT_THRESHOLDS: GenericPromotionDecisionThresholds = {
  minReadyRatio: 0.5,
  maxFallbackRatioP95: 0.05,
};

export const clampRatio = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return Number(value.toFixed(6));
};

export const normalizeCount = (value: number): number =>
  Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);

const normalizeDecisionThresholds = (
  overrides?: Partial<GenericPromotionDecisionThresholds>,
): GenericPromotionDecisionThresholds => ({
  minReadyRatio: clampRatio(
    overrides?.minReadyRatio ?? DEFAULT_THRESHOLDS.minReadyRatio,
  ),
  maxFallbackRatioP95: clampRatio(
    overrides?.maxFallbackRatioP95 ?? DEFAULT_THRESHOLDS.maxFallbackRatioP95,
  ),
});

export const evaluateGenericPromotionDecision = (
  input: GenericPromotionDecisionInput,
  overrides?: Partial<GenericPromotionDecisionThresholds>,
): GenericPromotionDecision => {
  const thresholds = normalizeDecisionThresholds(overrides);
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
    if (
      input.health.maxDaemonRejectRatio !== undefined &&
      input.health.daemonRejectRatio !== undefined &&
      clampRatio(input.health.daemonRejectRatio) >
        clampRatio(input.health.maxDaemonRejectRatio)
    ) {
      blockers.push(
        `daemon_reject_ratio_${
          clampRatio(input.health.daemonRejectRatio).toFixed(3)
        }_gt_${clampRatio(input.health.maxDaemonRejectRatio).toFixed(3)}`,
      );
      healthPass = false;
    }
    if (
      input.health.minEffectEvalCoverage !== undefined &&
      input.health.effectEvalCoverage !== undefined &&
      clampRatio(input.health.effectEvalCoverage) <
        clampRatio(input.health.minEffectEvalCoverage)
    ) {
      blockers.push(
        `effect_eval_coverage_${
          clampRatio(input.health.effectEvalCoverage).toFixed(3)
        }_lt_${clampRatio(input.health.minEffectEvalCoverage).toFixed(3)}`,
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

export type GenericPromotionActionInput<TMode extends string> = {
  currentMode: TMode;
  decision: GenericPromotionDecision;
};

export type GenericPromotionAction<TMode extends string> = {
  verdict: "promote" | "hold" | "demote";
  currentMode: TMode;
  targetMode: TMode;
  reasons: string[];
};

export const evaluateGenericPromotionAction = <TMode extends string>(
  input: GenericPromotionActionInput<TMode>,
): GenericPromotionAction<TMode> => {
  if (input.currentMode === "legacy-execute") {
    return {
      verdict: "hold",
      currentMode: input.currentMode,
      targetMode: input.currentMode,
      reasons: ["legacy_mode_requires_shadow_baseline"],
    };
  }

  if (input.currentMode === "shadow-reduce") {
    if (
      input.decision.verdict === "promote" &&
      input.decision.recommendedMode === "hybrid-reduce"
    ) {
      return {
        verdict: "promote",
        currentMode: input.currentMode,
        targetMode: "hybrid-reduce" as unknown as TMode,
        reasons: ["shadow_baseline_ready_for_hybrid"],
      };
    }
    return {
      verdict: "hold",
      currentMode: input.currentMode,
      targetMode: input.currentMode,
      reasons: input.decision.blockers.length > 0
        ? input.decision.blockers
        : ["shadow_mode_hold"],
    };
  }

  if (input.decision.verdict === "hold") {
    return {
      verdict: "demote",
      currentMode: input.currentMode,
      targetMode: "shadow-reduce" as unknown as TMode,
      reasons: input.decision.blockers.length > 0
        ? input.decision.blockers
        : ["hybrid_mode_requires_shadow_fallback"],
    };
  }

  return {
    verdict: "hold",
    currentMode: input.currentMode,
    targetMode: input.currentMode,
    reasons: ["hybrid_mode_confirmed"],
  };
};

export const GENERIC_PROMOTION_DECISION = {
  clampRatio,
  normalizeCount,
  evaluateGenericPromotionDecision,
  evaluateGenericPromotionAction,
};
