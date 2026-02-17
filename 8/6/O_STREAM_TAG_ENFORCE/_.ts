// i.L99.core.O_STREAM_TAG_ENFORCE.ts
// OMEGA-64 | O_STREAM_TAG_ENFORCE (Filter)

import type { DeltaProposal } from "../0/STATE_SNAPSHOT/_.ts";
import type { TagPolicy } from "../4/O_STREAM_TAG_POLICY/_.ts";

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
