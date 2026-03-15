---
id: REPLICATION_PROMOTION_ACTION
type: pure_fn
description: >-
  Determines the necessary action (promote/stay/rollback) based on Replication
  promotion evaluation.
tags:
  - core
  - control
  - host
min_level: 6
extra_symbols:
  - REPLICATION_PROMOTION_ACTION
  - ReplicationPromotionAction
  - ReplicationPromotionActionInput
  - evaluateReplicationPromotionAction
---
```typescript
import type { ReplicationExecutionMode } from "@g12";
import type { ReplicationPromotionDecision } from "@g12";

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
    return {
      verdict: "stay",
      targetMode: "hybrid-reduce",
      reasons: ["already_at_target_mode"],
    };
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

  return {
    verdict: "stay",
    targetMode: currentMode,
    reasons: ["unknown_current_mode"],
  };
};

export const REPLICATION_PROMOTION_ACTION = {
  evaluateReplicationPromotionAction
};

```
