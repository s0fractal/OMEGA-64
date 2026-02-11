// i.L99.core.GATE_ADMISSION_REPORT.ts
// OMEGA-64 | Gate Admission Report
// Aggregates proposal admission metrics emitted by L32 gate.

import { LEDGER } from "./i.L99.core.LEDGER.ts";
import type { LedgerEvent } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface GateAdmissionReportOptions {
  startTick?: number;
  endTick?: number;
  topAgents?: number;
}

export interface GateAdmissionTimelinePoint {
  tick: number;
  proposals: number;
  mean_weight: number;
  mean_reliability_effective: number;
  mean_phase_coherence?: number;
  mean_physical_cost: number;
}

export interface GateAdmissionAgentStats {
  agent_id: string;
  proposals: number;
  mean_weight: number;
  p95_weight: number;
  mean_reliability_effective: number;
  mean_phase_coherence?: number;
  mean_physical_cost: number;
}

export interface GateAdmissionReport {
  ok: boolean;
  startTick?: number;
  endTick?: number;
  eventsAnalyzed: number;
  eventsWithMetrics: number;
  proposalsAnalyzed: number;
  coherenceCoverage: number;
  weightMean: number;
  weightP95: number;
  reliabilityEffectiveMean: number;
  phaseCoherenceMean?: number;
  phaseCoherenceP95?: number;
  outOfPhasePressureMean?: number;
  topAgents: GateAdmissionAgentStats[];
  timeline: GateAdmissionTimelinePoint[];
  failures: string[];
}

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(p * sorted.length) - 1),
  );
  return sorted[idx];
};

const mean = (values: number[]): number =>
  values.length > 0 ? values.reduce((acc, v) => acc + v, 0) / values.length : 0;

const inWindow = (
  tick: number,
  startTick?: number,
  endTick?: number,
): boolean => {
  const inStart = startTick === undefined || tick >= startTick;
  const inEnd = endTick === undefined || tick <= endTick;
  return inStart && inEnd;
};

const isMutationEvent = (evt: LedgerEvent): boolean =>
  evt.state_after_hash !== evt.state_before_hash;

export const GATE_ADMISSION_REPORT = {
  generate: async (
    options: GateAdmissionReportOptions = {},
  ): Promise<GateAdmissionReport> => {
    const failures: string[] = [];
    const timeline: GateAdmissionTimelinePoint[] = [];
    const weightSeries: number[] = [];
    const reliabilitySeries: number[] = [];
    const coherenceSeries: number[] = [];
    const outOfPhaseSeries: number[] = [];
    const costSeries: number[] = [];
    const agentMap = new Map<
      string,
      Array<{
        weight: number;
        reliability_effective: number;
        phase_coherence?: number;
        physical_cost: number;
      }>
    >();

    let eventsAnalyzed = 0;
    let eventsWithMetrics = 0;
    let proposalsAnalyzed = 0;

    for await (const evt of LEDGER.readAll()) {
      if (!inWindow(evt.tick, options.startTick, options.endTick)) continue;
      if (!isMutationEvent(evt)) continue;
      eventsAnalyzed++;

      const metrics = evt.accepted_proposal_metrics ?? [];
      if (metrics.length === 0) {
        continue;
      }
      eventsWithMetrics++;
      proposalsAnalyzed += metrics.length;

      const tickWeights: number[] = [];
      const tickReliability: number[] = [];
      const tickCoherence: number[] = [];
      const tickCosts: number[] = [];

      for (const m of metrics) {
        if (typeof m.agent_id !== "string" || m.agent_id.length === 0) {
          failures.push(`INVALID_AGENT_ID_AT_TICK_${evt.tick}`);
          continue;
        }
        if (
          !Number.isFinite(m.weight) ||
          !Number.isFinite(m.reliability_effective)
        ) {
          failures.push(`INVALID_METRIC_NUMERIC_FIELD_AT_TICK_${evt.tick}`);
          continue;
        }
        tickWeights.push(m.weight);
        tickReliability.push(m.reliability_effective);
        tickCosts.push(m.physical_cost);
        weightSeries.push(m.weight);
        reliabilitySeries.push(m.reliability_effective);
        costSeries.push(m.physical_cost);
        if (
          m.phase_coherence !== undefined && Number.isFinite(m.phase_coherence)
        ) {
          tickCoherence.push(m.phase_coherence);
          coherenceSeries.push(m.phase_coherence);
          outOfPhaseSeries.push(1 - m.phase_coherence);
        }

        const current = agentMap.get(m.agent_id) ?? [];
        current.push({
          weight: m.weight,
          reliability_effective: m.reliability_effective,
          phase_coherence: m.phase_coherence,
          physical_cost: m.physical_cost,
        });
        agentMap.set(m.agent_id, current);
      }

      timeline.push({
        tick: evt.tick,
        proposals: tickWeights.length,
        mean_weight: mean(tickWeights),
        mean_reliability_effective: mean(tickReliability),
        mean_phase_coherence: tickCoherence.length > 0
          ? mean(tickCoherence)
          : undefined,
        mean_physical_cost: mean(tickCosts),
      });
    }

    const topN = Math.max(1, options.topAgents ?? 8);
    const topAgents: GateAdmissionAgentStats[] = Array.from(agentMap.entries())
      .map(([agent_id, values]) => {
        const weights = values.map((v) => v.weight);
        const rel = values.map((v) => v.reliability_effective);
        const coh = values
          .map((v) => v.phase_coherence)
          .filter((v): v is number =>
            typeof v === "number" && Number.isFinite(v)
          );
        const costs = values.map((v) => v.physical_cost);
        return {
          agent_id,
          proposals: values.length,
          mean_weight: mean(weights),
          p95_weight: percentile(weights, 0.95),
          mean_reliability_effective: mean(rel),
          mean_phase_coherence: coh.length > 0 ? mean(coh) : undefined,
          mean_physical_cost: mean(costs),
        };
      })
      .sort((a, b) => {
        if (b.proposals !== a.proposals) return b.proposals - a.proposals;
        if (b.mean_weight !== a.mean_weight) {
          return b.mean_weight - a.mean_weight;
        }
        return a.agent_id.localeCompare(b.agent_id);
      })
      .slice(0, topN);

    const coherenceCoverage = proposalsAnalyzed > 0
      ? coherenceSeries.length / proposalsAnalyzed
      : 0;

    return {
      ok: failures.length === 0,
      startTick: options.startTick,
      endTick: options.endTick,
      eventsAnalyzed,
      eventsWithMetrics,
      proposalsAnalyzed,
      coherenceCoverage,
      weightMean: mean(weightSeries),
      weightP95: percentile(weightSeries, 0.95),
      reliabilityEffectiveMean: mean(reliabilitySeries),
      phaseCoherenceMean: coherenceSeries.length > 0
        ? mean(coherenceSeries)
        : undefined,
      phaseCoherenceP95: coherenceSeries.length > 0
        ? percentile(coherenceSeries, 0.95)
        : undefined,
      outOfPhasePressureMean: outOfPhaseSeries.length > 0
        ? mean(outOfPhaseSeries)
        : undefined,
      topAgents,
      timeline,
      failures,
    };
  },
};
