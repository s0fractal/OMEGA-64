import type { ReplicationExecutionMode } from "../02_metabolism/mod.ts";

export type ReplicationHybridSnapshot = {
  mode: ReplicationExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  allowedReplications: number;
  suppressedReplications: number;
  shadowSuppressedReplications: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "emit"
    | "suppress"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: "emit" | "suppress" | "unknown";
  lastFallbackReason: string;
};

export type ReplicationPromotionThresholds = {
  minShadowRuns: number;
  maxFallbackRatio: number;
  minEmitBranchCount: number;
  minSuppressBranchCount: number;
  minShadowSuppressedReplications: number;
};

export type ReplicationPromotionStatus =
  | "legacy-baseline-needed"
  | "warming"
  | "ready"
  | "already-hybrid";

export type ReplicationPromotionSnapshot = {
  status: ReplicationPromotionStatus;
  ready: boolean;
  recommendedMode: ReplicationExecutionMode;
  shadowRuns: number;
  hybridRuns: number;
  reductionRuns: number;
  fallbackRuns: number;
  fallbackRatio: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  shadowSuppressedReplications: number;
  reasons: string[];
  thresholds: ReplicationPromotionThresholds;
};

const DEFAULT_PROMOTION_THRESHOLDS: ReplicationPromotionThresholds = {
  minShadowRuns: 16,
  maxFallbackRatio: 0.05,
  minEmitBranchCount: 0,
  minSuppressBranchCount: 0,
  minShadowSuppressedReplications: 0,
};

const clampRatio = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return Number(value.toFixed(6));
};

const normalizeCount = (value: number): number =>
  Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);

const normalizeThresholds = (
  overrides?: Partial<ReplicationPromotionThresholds>,
): ReplicationPromotionThresholds => ({
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
    0,
    Math.floor(
      overrides?.minEmitBranchCount ??
        DEFAULT_PROMOTION_THRESHOLDS.minEmitBranchCount,
    ),
  ),
  minSuppressBranchCount: Math.max(
    0,
    Math.floor(
      overrides?.minSuppressBranchCount ??
        DEFAULT_PROMOTION_THRESHOLDS.minSuppressBranchCount,
    ),
  ),
  minShadowSuppressedReplications: Math.max(
    0,
    Math.floor(
      overrides?.minShadowSuppressedReplications ??
        DEFAULT_PROMOTION_THRESHOLDS.minShadowSuppressedReplications,
    ),
  ),
});

export const evaluateReplicationPromotion = (
  raw: ReplicationHybridSnapshot,
  overrides?: Partial<ReplicationPromotionThresholds>,
): ReplicationPromotionSnapshot => {
  const thresholds = normalizeThresholds(overrides);
  const shadowRuns = normalizeCount(raw.shadowRuns);
  const hybridRuns = normalizeCount(raw.hybridRuns);
  const fallbackRuns = normalizeCount(raw.fallbackRuns);
  const emitBranchCount = normalizeCount(raw.emitBranchCount);
  const suppressBranchCount = normalizeCount(raw.suppressBranchCount);
  const shadowSuppressedReplications = normalizeCount(
    raw.shadowSuppressedReplications,
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
      shadowSuppressedReplications,
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
      shadowSuppressedReplications,
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
    shadowSuppressedReplications <
      thresholds.minShadowSuppressedReplications
  ) {
    reasons.push(
      `shadow_suppressed_replications_${shadowSuppressedReplications}_lt_${thresholds.minShadowSuppressedReplications}`,
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
    shadowSuppressedReplications,
    reasons,
    thresholds,
  };
};
