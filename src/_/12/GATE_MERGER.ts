// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/gate_merger.md
import { GateAcceptedProposalMetric, I16Limits, TYPES, REJECTION_CODES, LOGGER } from "@g11";

const clamp01 = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

const phaseCoherence = (
  agentPhase: number,
  delta: Array<{ level: number; value: number }>,
  phase_u16: Uint16Array | undefined,
  i16: I16Limits,
): number => {
  if (delta.length === 0) return 1;
  let weighted = 0;
  let weightSum = 0;
  for (const d of delta) {
    const levelPhase = phase_u16 ? phase_u16[d.level] : 0;
    let dPhi = Math.abs(agentPhase - levelPhase);
    if (dPhi > i16.max) dPhi = i16.span - dPhi;
    const angle = (dPhi / i16.max) * Math.PI;
    const coherence = (1 + Math.cos(angle)) / 2;
    const w = Math.max(1, Math.abs(d.value));
    weighted += coherence * w;
    weightSum += w;
  }
  return weightSum > 0 ? clamp01(weighted / weightSum) : 1;
};

export const mergeGateProposals = (
  state: StateSnapshot,
  validProposals: DeltaProposal[],
  config: GateConfig,
  decision: GateDecision,
  i16: I16Limits,
): {
  acceptedProposalMetrics: GateAcceptedProposalMetric[];
  maxTotalCost: number;
} => {
  const acceptedProposalMetrics: GateAcceptedProposalMetric[] = [];
  const reliabilityMode = config.reliability_mode ?? "STATIC";
  const reliabilityFloor = clamp01(config.reliability_floor ?? 0);
  const maxTotalCost =
    Number.isFinite(config.max_total_cost_per_tick ?? Infinity)
      ? Math.max(0, config.max_total_cost_per_tick ?? Infinity)
      : Infinity;

  validProposals.sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));

  const combinedDelta = new Map<number, number>();

  for (const p of validProposals) {
    if (p.resonance !== undefined) {
      Ld(
        `   [DEBUG PROPOSAL] ID: ${p.proposal_id}, resonance: ${p.resonance}`,
      );
    } else if (p.origin_atom_idx !== undefined) {
      const resonance = MX.getResonance(p.origin_atom_idx);
      Ld(
        `   [DEBUG PROPOSAL] ID: ${p.proposal_id}, looked up resonance: ${resonance}`,
      );
    } else {
      Ld(
        `   [DEBUG PROPOSAL] ID: ${p.proposal_id}, NO RESONANCE FOUND.`,
      );
    }

    let physicalCost = 0;
    const agentPhase = p.agent_phase_u16 ?? 0;
    for (const d of p.delta) {
      const levelPhase = state.phase_u16 ? state.phase_u16[d.level] : 0;
      const load = 1.0; // Legacy LOAD projection
      physicalCost += Math.abs(d.value) + load;
    }

    const atomResonance = p.resonance ??
      (p.origin_atom_idx !== undefined
        ? MX.getResonance(p.origin_atom_idx)
        : 0);
    const globalSyntropy = config.global_syntropy || 0;
    const localQuorum = p.quorum_strength || 0;

    if (atomResonance > 0 || globalSyntropy > 0 || localQuorum > 0) {
      // Sovereign Feedback: Successful collective organization rewards the system
      const resonanceDiscount = Math.min(0.8, atomResonance / 600);
      const syntropyDiscount = Math.min(0.2, globalSyntropy * 0.5); // Global systemic reward
      const quorumDiscount = Math.min(0.4, localQuorum * 0.8); // Local group reward

      const totalDiscount = Math.min(
        0.95,
        resonanceDiscount + syntropyDiscount + quorumDiscount,
      );

      const oldCost = physicalCost;
      physicalCost = physicalCost * (1 - totalDiscount);

      Ld(
        `      ⚖️ [SOVEREIGN] Route subsidized. Base: ${
          oldCost.toFixed(1)
        }, Res: ${atomResonance.toFixed(1)}, Quorum: ${
          localQuorum.toFixed(2)
        }, Syntropy: ${globalSyntropy.toFixed(2)}, Final Discount: ${
          (totalDiscount * 100).toFixed(1)
        }%`,
      );
    }

    const finalCost = Math.round(physicalCost);

    if (finalCost > (config.max_cost_per_agent || Infinity)) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.COST_OVER_BUDGET,
      });
      continue;
    }

    const nextTotalCost = decision.cost_used + finalCost;
    if (nextTotalCost > maxTotalCost) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.COST_OVER_BUDGET,
      });
      continue;
    }

    decision.accepted_proposals.push(p.proposal_id);
    decision.cost_used = nextTotalCost;

    const reliabilityBase = clamp01(
      config.reliability_weight.get(p.agent_id) ?? 1.0,
    );
    let phaseCoherenceScore: number | undefined = undefined;
    let agentReliability = reliabilityBase;
    if (reliabilityMode === "PHASE_COHERENCE") {
      phaseCoherenceScore = p.agent_phase_u16 === undefined
        ? 1
        : phaseCoherence(p.agent_phase_u16, p.delta, state.phase_u16, i16);
      const modulation = reliabilityFloor +
        (1 - reliabilityFloor) * phaseCoherenceScore;
      agentReliability *= modulation;
    }
    agentReliability = clamp01(agentReliability);
    const weight = p.confidence * agentReliability;
    acceptedProposalMetrics.push({
      proposal_id: p.proposal_id,
      agent_id: p.agent_id,
      confidence: p.confidence,
      reliability_base: reliabilityBase,
      reliability_effective: agentReliability,
      phase_coherence: phaseCoherenceScore,
      weight,
      physical_cost: finalCost,
      agent_phase_u16: p.agent_phase_u16,
    });

    for (const d of p.delta) {
      let val = d.value;
      if (Math.abs(val) > config.max_abs_delta_per_level) {
        val = Math.sign(val) * config.max_abs_delta_per_level;
      }

      const weightedVal = val * weight;
      const current = combinedDelta.get(d.level) || 0;
      combinedDelta.set(d.level, current + weightedVal);
    }
  }

  const totalAbsDelta = GATE_BUDGET.totalAbsDeltaRounded(combinedDelta);
  decision.budget_used = totalAbsDelta;
  const scaleFactor = GATE_BUDGET.computeScaleFactor(
    totalAbsDelta,
    config.max_total_abs_delta_per_tick,
  );
  decision.accepted_delta = GATE_BUDGET.flattenScaledDelta(
    combinedDelta,
    scaleFactor,
  );

  return {
    acceptedProposalMetrics,
    maxTotalCost,
  };
};

export const GATE_MERGER = {
};
