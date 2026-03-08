// i.L99.core.POLICY_TRANSITION.ts
// OMEGA-64 | Canon Protocol | Policy Migration Events

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import {
  CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_POLICY,
} from "./i.L99.core.CRYSTALLIZATION_CONFIG.ts";
import {
  AutonomyState,
  LedgerEvent,
  PolicyTransitionEvent,
  TopologyEvent,
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import { AUTONOMY_METRIC } from "./i.L99.core.AUTONOMY_METRIC.ts";

export interface PolicyTransitionEmitInput {
  tick: number;
  to_policy_version: string;
  to_policy_hash: string;
  reason: string;
  witness?: string;
}

const isPolicyTransitionEvent = (
  entry: TopologyEvent,
): entry is PolicyTransitionEvent =>
  "event_type" in entry && entry.event_type === "POLICY_TRANSITION_EVENT";

const isLedgerEventWithPolicy = (entry: TopologyEvent): entry is LedgerEvent =>
  !("event_type" in entry) &&
  typeof entry.tick === "number" &&
  typeof entry.policy_version === "string" &&
  typeof entry.policy_hash === "string";

const hasTick = (
  entry: TopologyEvent,
): entry is TopologyEvent & { tick: number } =>
  "tick" in entry && typeof entry.tick === "number";

export const POLICY_TRANSITION = {
  currentPolicyAnchor: async (): Promise<
    { version: string; hash: string }
  > => ({
    version: CRYSTALLIZATION_CONFIG.policyVersion,
    hash: await CRYSTALLIZATION_POLICY.hash(),
  }),

  latestPolicyAnchorAtOrBefore: async (
    tickInclusive: number,
  ): Promise<{ version?: string; hash?: string; tick?: number }> => {
    let bestTick = -Infinity;
    let version: string | undefined;
    let hash: string | undefined;

    for await (const entry of LEDGER.readAllRaw()) {
      if (!hasTick(entry)) continue;
      if (entry.tick > tickInclusive) continue;

      if (isPolicyTransitionEvent(entry)) {
        if (entry.tick >= bestTick) {
          bestTick = entry.tick;
          version = entry.to_policy_version;
          hash = entry.to_policy_hash;
        }
        continue;
      }

      if (isLedgerEventWithPolicy(entry)) {
        if (entry.tick >= bestTick) {
          bestTick = entry.tick;
          version = entry.policy_version;
          hash = entry.policy_hash;
        }
      }
    }

    if (version && hash) {
      return { version, hash, tick: bestTick };
    }
    return {};
  },

  emit: async (
    input: PolicyTransitionEmitInput,
  ): Promise<PolicyTransitionEvent> => {
    const prev = await POLICY_TRANSITION.latestPolicyAnchorAtOrBefore(
      input.tick - 1,
    );

    const event: PolicyTransitionEvent = {
      event_type: "POLICY_TRANSITION_EVENT",
      tick: input.tick,
      from_policy_version: prev.version,
      from_policy_hash: prev.hash,
      to_policy_version: input.to_policy_version,
      to_policy_hash: input.to_policy_hash,
      reason: input.reason,
      witness: input.witness,
    };

    await LEDGER.append(event);
    return event;
  },

  /**
   * Era 5.0 | Current Autonomy Configuration
   * 0.0: Manual/Locked
   * 1.0: Full Sovereignty
   */
  /**
   * Era 5.3 | Current Autonomy Configuration
   * Proxy for dynamic AUTONOMY_METRIC.
   */
  currentAutonomy: async (): Promise<AutonomyState> => {
    const report = await AUTONOMY_METRIC.compute();
    return report.levels;
  },
};
