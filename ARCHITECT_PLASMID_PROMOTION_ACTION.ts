import type { ArchitectPlasmidPromotionDecision } from "./ARCHITECT_PLASMID_PROMOTION_DECISION.ts";
import type { ArchitectPlasmidExecutionMode } from "./runtime_bridge/architect_plasmid_hybrid.ts";

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
