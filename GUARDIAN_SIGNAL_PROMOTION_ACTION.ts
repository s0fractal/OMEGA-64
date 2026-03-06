import type { GuardianSignalPromotionDecision } from "./GUARDIAN_SIGNAL_PROMOTION_DECISION.ts";
import type { GuardianSignalExecutionMode } from "./runtime_bridge/guardian_signal_hybrid.ts";

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
