---
id: REPLICATION_PROMOTION_DECISION
type: pure_fn
description: >-
  Evaluates promotion conditions for Replication loops in hybrid shadow
  reduction.
tags:
  - core
  - control
  - host
deps:
  - GENERIC_PROMOTION_DECISION
  - evaluateGenericPromotionDecision
  - evaluateGenericPromotionAction
  - clampRatio
  - normalizeCount
extra_symbols:
  - REPLICATION_PROMOTION_DECISION
  - ReplicationPromotionDecision
  - ReplicationPromotionDecisionInput
  - ReplicationPromotionDecisionThresholds
  - evaluateReplicationPromotionDecision
---
```typescript
import {
  GenericPromotionDecision,
  GenericPromotionDecisionInput,
  GenericPromotionDecisionThresholds,
} from "@g12";

export type ReplicationPromotionDecisionInput = GenericPromotionDecisionInput;
export type ReplicationPromotionDecisionThresholds =
  GenericPromotionDecisionThresholds;
export type ReplicationPromotionDecision = GenericPromotionDecision;

/** @deprecated Use evaluateGenericPromotionDecision */
export const evaluateReplicationPromotionDecision =
  evaluateGenericPromotionDecision;

export const REPLICATION_PROMOTION_DECISION = {
  evaluateReplicationPromotionDecision,
};


```
