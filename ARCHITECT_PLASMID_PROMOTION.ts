import type { ArchitectPlasmidExecutionMode } from "./runtime_bridge/architect_plasmid_hybrid.ts";

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

const clampRatio = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return Number(value.toFixed(6));
};

const normalizeCount = (value: number): number =>
  Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);

const normalizeThresholds = (
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
  const thresholds = normalizeThresholds(overrides);
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
