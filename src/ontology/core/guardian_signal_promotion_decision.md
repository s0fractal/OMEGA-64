---
id: GUARDIAN_SIGNAL_PROMOTION_DECISION
type: pure_fn
description: >-
  Evaluates promotion conditions for Guardian Signals in the hybrid shadow
  reduction flow.
tags:
  - core
  - control
  - host
min_level: 6
extra_symbols:
  - GUARDIAN_SIGNAL_PROMOTION_DECISION
  - GuardianSignalHybridSnapshot
  - GuardianSignalPromotionAction
  - GuardianSignalPromotionActionInput
  - GuardianSignalPromotionDecision
  - GuardianSignalPromotionDecisionInput
  - GuardianSignalPromotionDecisionThresholds
  - GuardianSignalPromotionSnapshot
  - GuardianSignalPromotionStatus
  - GuardianSignalPromotionThresholds
  - evaluateGuardianSignalPromotion
  - evaluateGuardianSignalPromotionAction
  - evaluateGuardianSignalPromotionDecision
---
```typescript
import type { GuardianSignalExecutionMode } from "@g12";

export type GuardianSignalPromotionDecisionInput = {
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

export type GuardianSignalPromotionDecisionThresholds = {
  minReadyRatio: number;
  maxFallbackRatioP95: number;
};

export type GuardianSignalPromotionDecision = {
  verdict: "promote" | "hold";
  promotionReady: boolean;
  healthPass: boolean;
  recommendedMode: "hybrid-reduce" | "shadow-reduce";
  blockers: string[];
  thresholds: GuardianSignalPromotionDecisionThresholds;
};

const DEFAULT_THRESHOLDS: GuardianSignalPromotionDecisionThresholds = {
  minReadyRatio: 0.5,
  maxFallbackRatioP95: 0.05,
};

const clampRatio = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return Number(value.toFixed(6));
};

const normalizeDecisionThresholds = (
  overrides?: Partial<GuardianSignalPromotionDecisionThresholds>,
): GuardianSignalPromotionDecisionThresholds => ({
  minReadyRatio: clampRatio(
    overrides?.minReadyRatio ?? DEFAULT_THRESHOLDS.minReadyRatio,
  ),
  maxFallbackRatioP95: clampRatio(
    overrides?.maxFallbackRatioP95 ?? DEFAULT_THRESHOLDS.maxFallbackRatioP95,
  ),
});

export const evaluateGuardianSignalPromotionDecision = (
  input: GuardianSignalPromotionDecisionInput,
  overrides?: Partial<GuardianSignalPromotionDecisionThresholds>,
): GuardianSignalPromotionDecision => {
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

export type GuardianSignalHybridSnapshot = {
  mode: GuardianSignalExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  stableBranchCount: number;
  repairBranchCount: number;
  allowedGuardianSignals: number;
  suppressedGuardianSignals: number;
  shadowSuppressedGuardianSignals: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "stable"
    | "repair"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: "stable" | "repair" | "unknown";
  lastFallbackReason: string;
};

export type GuardianSignalPromotionThresholds = {
  minShadowRuns: number;
  maxFallbackRatio: number;
  minStableBranchCount: number;
  minRepairBranchCount: number;
  minShadowSuppressedGuardianSignals: number;
};

export type GuardianSignalPromotionStatus =
  | "legacy-baseline-needed"
  | "warming"
  | "ready"
  | "already-hybrid";

export type GuardianSignalPromotionSnapshot = {
  status: GuardianSignalPromotionStatus;
  ready: boolean;
  recommendedMode: GuardianSignalExecutionMode;
  shadowRuns: number;
  hybridRuns: number;
  reductionRuns: number;
  fallbackRuns: number;
  fallbackRatio: number;
  stableBranchCount: number;
  repairBranchCount: number;
  shadowSuppressedGuardianSignals: number;
  reasons: string[];
  thresholds: GuardianSignalPromotionThresholds;
};

const DEFAULT_PROMOTION_THRESHOLDS: GuardianSignalPromotionThresholds = {
  minShadowRuns: 64,
  maxFallbackRatio: 0.05,
  minStableBranchCount: 8,
  minRepairBranchCount: 4,
  minShadowSuppressedGuardianSignals: 4,
};

const normalizeCount = (value: number): number =>
  Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);

const normalizePromoThresholds = (
  overrides?: Partial<GuardianSignalPromotionThresholds>,
): GuardianSignalPromotionThresholds => ({
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
  minStableBranchCount: Math.max(
    1,
    Math.floor(
      overrides?.minStableBranchCount ??
        DEFAULT_PROMOTION_THRESHOLDS.minStableBranchCount,
    ),
  ),
  minRepairBranchCount: Math.max(
    1,
    Math.floor(
      overrides?.minRepairBranchCount ??
        DEFAULT_PROMOTION_THRESHOLDS.minRepairBranchCount,
    ),
  ),
  minShadowSuppressedGuardianSignals: Math.max(
    1,
    Math.floor(
      overrides?.minShadowSuppressedGuardianSignals ??
        DEFAULT_PROMOTION_THRESHOLDS.minShadowSuppressedGuardianSignals,
    ),
  ),
});

export const evaluateGuardianSignalPromotion = (
  raw: GuardianSignalHybridSnapshot,
  overrides?: Partial<GuardianSignalPromotionThresholds>,
): GuardianSignalPromotionSnapshot => {
  const thresholds = normalizePromoThresholds(overrides);
  const shadowRuns = normalizeCount(raw.shadowRuns);
  const hybridRuns = normalizeCount(raw.hybridRuns);
  const fallbackRuns = normalizeCount(raw.fallbackRuns);
  const stableBranchCount = normalizeCount(raw.stableBranchCount);
  const repairBranchCount = normalizeCount(raw.repairBranchCount);
  const shadowSuppressedGuardianSignals = normalizeCount(
    raw.shadowSuppressedGuardianSignals,
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
      stableBranchCount,
      repairBranchCount,
      shadowSuppressedGuardianSignals,
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
      stableBranchCount,
      repairBranchCount,
      shadowSuppressedGuardianSignals,
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
  if (stableBranchCount < thresholds.minStableBranchCount) {
    reasons.push(
      `stable_branch_count_${stableBranchCount}_lt_${thresholds.minStableBranchCount}`,
    );
  }
  if (repairBranchCount < thresholds.minRepairBranchCount) {
    reasons.push(
      `repair_branch_count_${repairBranchCount}_lt_${thresholds.minRepairBranchCount}`,
    );
  }
  if (
    shadowSuppressedGuardianSignals <
    thresholds.minShadowSuppressedGuardianSignals
  ) {
    reasons.push(
      `shadow_suppressed_guardian_signals_${shadowSuppressedGuardianSignals}_lt_${thresholds.minShadowSuppressedGuardianSignals}`,
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
    stableBranchCount,
    repairBranchCount,
    shadowSuppressedGuardianSignals,
    reasons,
    thresholds,
  };
};

export type GuardianSignalPromotionActionInput = {
  currentMode: GuardianSignalExecutionMode;
  decision: GuardianSignalPromotionDecision;
};

export type GuardianSignalPromotionAction = {
  verdict: "promote" | "hold" | "demote";
  currentMode: GuardianSignalExecutionMode;
  targetMode: GuardianSignalExecutionMode;
  reasons: string[];
};

export const evaluateGuardianSignalPromotionAction = (
  input: GuardianSignalPromotionActionInput,
): GuardianSignalPromotionAction => {
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

export const GUARDIAN_SIGNAL_PROMOTION_DECISION = {
  evaluateGuardianSignalPromotionDecision,
  evaluateGuardianSignalPromotion,
  evaluateGuardianSignalPromotionAction
};

```
