// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/replication_promotion_action.md
import { GENERIC_PROMOTION_DECISION, evaluateGenericPromotionDecision, evaluateGenericPromotionAction, clampRatio, normalizeCount } from "@g06";

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
