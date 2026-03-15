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
deps:
  - GENERIC_PROMOTION_DECISION
  - evaluateGenericPromotionDecision
  - evaluateGenericPromotionAction
  - clampRatio
  - normalizeCount
extra_symbols:
  - REPLICATION_PROMOTION_ACTION
  - ReplicationPromotionAction
  - ReplicationPromotionActionInput
  - evaluateReplicationPromotionAction
---
```typescript
import {
  GenericPromotionAction,
  GenericPromotionActionInput,
} from "@g12";

export type ReplicationPromotionActionInput = GenericPromotionActionInput;
export type ReplicationPromotionAction = GenericPromotionAction;

/** @deprecated Use evaluateGenericPromotionAction */
export const evaluateReplicationPromotionAction =
  evaluateGenericPromotionAction;

export const REPLICATION_PROMOTION_ACTION = {
  evaluateReplicationPromotionAction,
};



```
