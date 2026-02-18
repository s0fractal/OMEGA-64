// i.L99.core.O_STREAM_DRAIN.ts
// OMEGA-64 | O_STREAM_DRAIN (Prune)

import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal } from "@omega";
import { O_STREAM_PATH_O_STREAM_PATH as O_STREAM_PATH } from "@omega";
import { O_STREAM_READ_O_STREAM_READ as O_STREAM_READ } from "@omega";
import { O_STREAM_VALIDATE_O_STREAM_VALIDATE as O_STREAM_VALIDATE } from "@omega";
import { O_STREAM_ARCHIVE_O_STREAM_ARCHIVE as O_STREAM_ARCHIVE } from "@omega";
import { O_STREAM_ARCHIVE_PATH_O_STREAM_ARCHIVE_PATH as O_STREAM_ARCHIVE_PATH } from "@omega";

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
