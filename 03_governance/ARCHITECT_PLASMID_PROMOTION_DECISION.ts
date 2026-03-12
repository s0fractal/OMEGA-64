import type { ArchitectPlasmidExecutionMode } from "@02";

export type ArchitectPlasmidPromotionDecisionInput = {
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

export type ArchitectPlasmidPromotionDecisionThresholds = {
  minReadyRatio: number;
  maxFallbackRatioP95: number;
};

export type ArchitectPlasmidPromotionDecision = {
  verdict: "promote" | "hold";
  promotionReady: boolean;
  healthPass: boolean;
  recommendedMode: "hybrid-reduce" | "shadow-reduce";
  blockers: string[];
  thresholds: ArchitectPlasmidPromotionDecisionThresholds;
};

const DEFAULT_THRESHOLDS: ArchitectPlasmidPromotionDecisionThresholds = {
  minReadyRatio: 0.5,
  maxFallbackRatioP95: 0.05,
};

const clampRatio = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return Number(value.toFixed(6));
};

const normalizeDecisionThresholds = (
  overrides?: Partial<ArchitectPlasmidPromotionDecisionThresholds>,
): ArchitectPlasmidPromotionDecisionThresholds => ({
  minReadyRatio: clampRatio(
    overrides?.minReadyRatio ?? DEFAULT_THRESHOLDS.minReadyRatio,
  ),
  maxFallbackRatioP95: clampRatio(
    overrides?.maxFallbackRatioP95 ?? DEFAULT_THRESHOLDS.maxFallbackRatioP95,
  ),
});

export const evaluateArchitectPlasmidPromotionDecision = (
  input: ArchitectPlasmidPromotionDecisionInput,
  overrides?: Partial<ArchitectPlasmidPromotionDecisionThresholds>,
): ArchitectPlasmidPromotionDecision => {
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

export type ArchitectPlasmidHybridSnapshot = {
  mode: ArchitectPlasmidExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  allowedArchitectPlasmids: number;
  suppressedArchitectPlasmids: number;
  shadowSuppressedArchitectPlasmids: number;
  lastTick: number;
  lastStatus: "legacy" | "emit" | "suppress" | "fallback";
  lastBranch: "emit" | "suppress" | "unknown";
  lastFallbackReason: string;
};

export type ArchitectPlasmidPromotionThresholds = {
  minShadowRuns: number;
  maxFallbackRatio: number;
  minEmitBranchCount: number;
  minSuppressBranchCount: number;
  minShadowSuppressedArchitectPlasmids: number;
};

export type ArchitectPlasmidPromotionStatus =
  | "legacy-baseline-needed"
  | "warming"
  | "ready"
  | "already-hybrid";

export type ArchitectPlasmidPromotionSnapshot = {
  status: ArchitectPlasmidPromotionStatus;
  ready: boolean;
  recommendedMode: ArchitectPlasmidExecutionMode;
  shadowRuns: number;
  hybridRuns: number;
  reductionRuns: number;
  fallbackRuns: number;
  fallbackRatio: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  shadowSuppressedArchitectPlasmids: number;
  reasons: string[];
  thresholds: ArchitectPlasmidPromotionThresholds;
};

const DEFAULT_PROMOTION_THRESHOLDS: ArchitectPlasmidPromotionThresholds = {
  minShadowRuns: 64,
  maxFallbackRatio: 0.05,
  minEmitBranchCount: 8,
  minSuppressBranchCount: 4,
  minShadowSuppressedArchitectPlasmids: 4,
};

const normalizeCount = (value: number): number =>
  Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);

const normalizePromoThresholds = (
  overrides?: Partial<ArchitectPlasmidPromotionThresholds>,
): ArchitectPlasmidPromotionThresholds => ({
  minShadowRuns: Math.max(
    1,
    Math.floor(
      overrides?.minShadowRuns ?? DEFAULT_PROMOTION_THRESHOLDS.minShadowRuns,
    ),
  ),
  maxFallbackRatio: clampRatio(
    overrides?.maxFallbackRatio ??
      DEFAULT_PROMOTION_THRESHOLDS.maxFallbackRatio,
  ),
  minEmitBranchCount: Math.max(
    1,
    Math.floor(
      overrides?.minEmitBranchCount ??
        DEFAULT_PROMOTION_THRESHOLDS.minEmitBranchCount,
    ),
  ),
  minSuppressBranchCount: Math.max(
    1,
    Math.floor(
      overrides?.minSuppressBranchCount ??
        DEFAULT_PROMOTION_THRESHOLDS.minSuppressBranchCount,
    ),
  ),
  minShadowSuppressedArchitectPlasmids: Math.max(
    1,
    Math.floor(
      overrides?.minShadowSuppressedArchitectPlasmids ??
        DEFAULT_PROMOTION_THRESHOLDS.minShadowSuppressedArchitectPlasmids,
    ),
  ),
});

export const evaluateArchitectPlasmidPromotion = (
  raw: ArchitectPlasmidHybridSnapshot,
  overrides?: Partial<ArchitectPlasmidPromotionThresholds>,
): ArchitectPlasmidPromotionSnapshot => {
  const thresholds = normalizePromoThresholds(overrides);
  const shadowRuns = normalizeCount(raw.shadowRuns);
  const hybridRuns = normalizeCount(raw.hybridRuns);
  const fallbackRuns = normalizeCount(raw.fallbackRuns);
  const emitBranchCount = normalizeCount(raw.emitBranchCount);
  const suppressBranchCount = normalizeCount(raw.suppressBranchCount);
  const shadowSuppressedArchitectPlasmids = normalizeCount(
    raw.shadowSuppressedArchitectPlasmids,
  );
  const reductionRuns = shadowRuns + hybridRuns;
  const reductionDenominator = Math.max(1, reductionRuns);
  const shadowDenominator = Math.max(1, shadowRuns);
  const fallbackRatio = clampRatio(fallbackRuns / reductionDenominator);
  const reasons: string[] = [];

  if (raw.mode === "legacy-execute") {
    reasons.push("mode_legacy_execute_requires_shadow_baseline");
    return {
      status: "legacy-baseline-needed",
      ready: false,
      recommendedMode: "shadow-reduce",
      shadowRuns,
      hybridRuns,
      reductionRuns,
      fallbackRuns,
      fallbackRatio,
      emitBranchCount,
      suppressBranchCount,
      shadowSuppressedArchitectPlasmids,
      reasons,
      thresholds,
    };
  }

  if (raw.mode === "hybrid-reduce") {
    reasons.push("mode_already_hybrid_reduce");
    return {
      status: "already-hybrid",
      ready: true,
      recommendedMode: "hybrid-reduce",
      shadowRuns,
      hybridRuns,
      reductionRuns,
      fallbackRuns,
      fallbackRatio,
      emitBranchCount,
      suppressBranchCount,
      shadowSuppressedArchitectPlasmids,
      reasons,
      thresholds,
    };
  }

  if (shadowRuns < thresholds.minShadowRuns) {
    reasons.push(`shadow_runs_${shadowRuns}_lt_${thresholds.minShadowRuns}`);
  }
  if (fallbackRatio > thresholds.maxFallbackRatio) {
    reasons.push(
      `fallback_ratio_${fallbackRatio.toFixed(6)}_gt_${
        thresholds.maxFallbackRatio.toFixed(6)
      }`,
    );
  }
  if (emitBranchCount < thresholds.minEmitBranchCount) {
    reasons.push(
      `emit_branch_count_${emitBranchCount}_lt_${thresholds.minEmitBranchCount}`,
    );
  }
  if (suppressBranchCount < thresholds.minSuppressBranchCount) {
    reasons.push(
      `suppress_branch_count_${suppressBranchCount}_lt_${thresholds.minSuppressBranchCount}`,
    );
  }
  if (
    shadowSuppressedArchitectPlasmids <
      thresholds.minShadowSuppressedArchitectPlasmids
  ) {
    reasons.push(
      `shadow_suppressed_architect_plasmids_${shadowSuppressedArchitectPlasmids}_lt_${thresholds.minShadowSuppressedArchitectPlasmids}`,
    );
  }
  if (fallbackRuns > shadowDenominator) {
    reasons.push("fallback_runs_exceed_shadow_window");
  }

  const ready = reasons.length === 0;
  return {
    status: ready ? "ready" : "warming",
    ready,
    recommendedMode: ready ? "hybrid-reduce" : "shadow-reduce",
    shadowRuns,
    hybridRuns,
    reductionRuns,
    fallbackRuns,
    fallbackRatio,
    emitBranchCount,
    suppressBranchCount,
    shadowSuppressedArchitectPlasmids,
    reasons,
    thresholds,
  };
};

export type ArchitectPlasmidPromotionActionInput = {
  currentMode: ArchitectPlasmidExecutionMode;
  decision: ArchitectPlasmidPromotionDecision;
};

export type ArchitectPlasmidPromotionAction = {
  verdict: "promote" | "hold" | "demote";
  currentMode: ArchitectPlasmidExecutionMode;
  targetMode: ArchitectPlasmidExecutionMode;
  reasons: string[];
};

export const evaluateArchitectPlasmidPromotionAction = (
  input: ArchitectPlasmidPromotionActionInput,
): ArchitectPlasmidPromotionAction => {
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
        targetMode: "hybrid-reduce",
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
      targetMode: "shadow-reduce",
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
