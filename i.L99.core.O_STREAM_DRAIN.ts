// i.L99.core.O_STREAM_DRAIN.ts
// OMEGA-64 | O_STREAM_DRAIN (Prune)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";
import { O_STREAM_READ } from "./i.L99.core.O_STREAM_READ.ts";
import { O_STREAM_VALIDATE } from "./i.L99.core.O_STREAM_VALIDATE.ts";

export const O_STREAM_DRAIN = async (
  consumedProposalIds: string[],
  path: string = O_STREAM_PATH(),
): Promise<DeltaProposal[]> => {
  const current = O_STREAM_VALIDATE(await O_STREAM_READ(path));
  if (consumedProposalIds.length === 0) return current;
  const consumed = new Set(consumedProposalIds);
  const next = current.filter((proposal) => !consumed.has(proposal.proposal_id));
  const payload = next.map((proposal) => JSON.stringify(proposal)).join("\n");
  await Deno.writeTextFile(path, payload.length ? `${payload}\n` : "");
  return next;
};
