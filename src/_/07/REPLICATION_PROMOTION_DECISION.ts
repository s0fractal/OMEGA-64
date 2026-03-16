// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/replication_promotion_decision.md
import { GENERIC_PROMOTION_DECISION, evaluateGenericPromotionDecision, evaluateGenericPromotionAction, clampRatio, normalizeCount } from "@g06";

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
