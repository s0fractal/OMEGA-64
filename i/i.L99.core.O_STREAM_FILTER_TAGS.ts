// i.L99.core.O_STREAM_FILTER_TAGS.ts
// OMEGA-64 | O_STREAM_FILTER_TAGS (Filter)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

export type OStreamTaggedProposal = DeltaProposal & { tags?: string[] };

export const O_STREAM_FILTER_TAGS = (
  proposals: OStreamTaggedProposal[],
  requiredTags: string[],
): OStreamTaggedProposal[] => {
  if (requiredTags.length === 0) return proposals;
  const required = new Set(requiredTags);
  return proposals.filter((proposal) => {
    const tags = proposal.tags ?? [];
    if (tags.length === 0) return false;
    for (const tag of required) {
      if (!tags.includes(tag)) return false;
    }
    return true;
  });
};
