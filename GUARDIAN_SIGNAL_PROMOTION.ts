import type { GuardianSignalExecutionMode } from "./runtime_bridge/guardian_signal_hybrid.ts";

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

const clampRatio = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return Number(value.toFixed(6));
};

const normalizeCount = (value: number): number =>
  Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);

const normalizeThresholds = (
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
  const thresholds = normalizeThresholds(overrides);
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
      `fallback_ratio_${fallbackRatio.toFixed(6)}_gt_${thresholds.maxFallbackRatio.toFixed(6)}`,
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
