// i.L99.core.O_STREAM_TAG.ts
// OMEGA-64 | O_STREAM_TAG (Compatibility)

import type { DeltaProposal } from "../0/STATE_SNAPSHOT/_.ts";

export type OStreamTaggedProposal = DeltaProposal & {
  tags?: string[];
};

export const O_STREAM_TAG = (
  proposal: DeltaProposal,
  tags: string[],
): OStreamTaggedProposal => ({
  ...proposal,
  tags: [...tags],
});
