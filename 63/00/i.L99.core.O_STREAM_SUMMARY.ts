// i.L99.core.O_STREAM_SUMMARY.ts
// OMEGA-64 | O_STREAM_SUMMARY (Diagnostics)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

export type OStreamSummary = {
  total: number;
  unique_agents: number;
  by_agent: Record<string, number>;
  by_target_path: Record<string, number>;
  by_level: Record<string, number>;
};

const recordSorted = (entries: Array<[string, number]>): Record<string, number> => {
  const sorted = entries.slice().sort((a, b) => a[0].localeCompare(b[0]));
  return Object.fromEntries(sorted);
};

export const O_STREAM_SUMMARY = (proposals: DeltaProposal[]): OStreamSummary => {
  const byAgent = new Map<string, number>();
  const byTarget = new Map<string, number>();
  const byLevel = new Map<string, number>();

  for (const proposal of proposals) {
    byAgent.set(proposal.agent_id, (byAgent.get(proposal.agent_id) ?? 0) + 1);
    const target = proposal.target_path ?? "UNSPECIFIED";
    byTarget.set(target, (byTarget.get(target) ?? 0) + 1);
    for (const delta of proposal.delta) {
      const key = `${delta.level}`;
      byLevel.set(key, (byLevel.get(key) ?? 0) + 1);
    }
  }

  return {
    total: proposals.length,
    unique_agents: byAgent.size,
    by_agent: recordSorted([...byAgent.entries()]),
    by_target_path: recordSorted([...byTarget.entries()]),
    by_level: recordSorted([...byLevel.entries()]),
  };
};
