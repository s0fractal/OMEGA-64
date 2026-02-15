// i.L99.core.O_STREAM_DRAIN.ts
// OMEGA-64 | O_STREAM_DRAIN (Prune)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";
import { O_STREAM_READ } from "./i.L99.core.O_STREAM_READ.ts";
import { O_STREAM_VALIDATE } from "./i.L99.core.O_STREAM_VALIDATE.ts";
import { O_STREAM_ARCHIVE } from "./i.L99.core.O_STREAM_ARCHIVE.ts";
import { O_STREAM_ARCHIVE_PATH } from "./i.L99.core.O_STREAM_ARCHIVE_PATH.ts";

export const O_STREAM_DRAIN = async (
  consumedProposalIds: string[],
  path: string = O_STREAM_PATH(),
  archivePath: string = O_STREAM_ARCHIVE_PATH(),
): Promise<DeltaProposal[]> => {
  const current = O_STREAM_VALIDATE(await O_STREAM_READ(path));
  if (consumedProposalIds.length === 0) return current;
  const consumed = new Set(consumedProposalIds);
  const archived = current.filter((proposal) => consumed.has(proposal.proposal_id));
  const next = current.filter((proposal) => !consumed.has(proposal.proposal_id));
  await O_STREAM_ARCHIVE(archived, archivePath);
  const payload = next.map((proposal) => JSON.stringify(proposal)).join("\n");
  await Deno.writeTextFile(path, payload.length ? `${payload}\n` : "");
  return next;
};
