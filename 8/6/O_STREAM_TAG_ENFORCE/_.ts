// i.L99.core.O_STREAM_TAG_ENFORCE.ts
// OMEGA-64 | O_STREAM_TAG_ENFORCE (Filter)

import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal } from "@omega";
import type { O_STREAM_TAG_POLICY_TagPolicy as TagPolicy } from "@omega";

export type OStreamTaggedProposal = DeltaProposal & { tags?: string[] };

export const O_STREAM_TAG_ENFORCE = (
  proposals: OStreamTaggedProposal[],
  policy: TagPolicy,
): OStreamTaggedProposal[] => {
  const allow = new Set(policy.allow);
  return proposals.filter((proposal) => {
    const tags = proposal.tags ?? [];
    if (tags.length === 0) return true;
    return tags.every((tag) => allow.has(tag));
  });
};
