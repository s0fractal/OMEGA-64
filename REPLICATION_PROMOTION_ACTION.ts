import type { ReplicationExecutionMode } from "./runtime_bridge/replication_hybrid.ts";
import type { ReplicationPromotionDecision } from "./REPLICATION_PROMOTION_DECISION.ts";

export type ReplicationPromotionActionInput = {
  currentMode: ReplicationExecutionMode;
  decision: ReplicationPromotionDecision;
};

export type ReplicationPromotionAction = {
  verdict: "promote" | "stay" | "rollback";
  targetMode: ReplicationExecutionMode;
  reasons: string[];
};

export const evaluateReplicationPromotionAction = (
  input: ReplicationPromotionActionInput,
): ReplicationPromotionAction => {
  const { currentMode, decision } = input;
  const reasons: string[] = [];

  if (currentMode === "hybrid-reduce") {
    if (decision.verdict === "hold" && !decision.healthPass) {
      reasons.push("health_regression_in_hybrid_mode");
      // Note: We don't automatically rollback to shadow-reduce here to avoid oscillating
      // unless the health regression is severe. For now, we stay.
      return { verdict: "stay", targetMode: "hybrid-reduce", reasons };
    }
    return { verdict: "stay", targetMode: "hybrid-reduce", reasons: ["already_at_target_mode"] };
  }

  if (currentMode === "shadow-reduce") {
    if (decision.verdict === "promote") {
      reasons.push("promotion_criteria_met");
      return { verdict: "promote", targetMode: "hybrid-reduce", reasons };
    }
    reasons.push(...decision.blockers);
    return { verdict: "stay", targetMode: "shadow-reduce", reasons };
  }

  if (currentMode === "legacy-execute") {
    reasons.push("enabling_shadow_baseline");
    return { verdict: "promote", targetMode: "shadow-reduce", reasons };
  }

  return { verdict: "stay", targetMode: currentMode, reasons: ["unknown_current_mode"] };
};
