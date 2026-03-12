// i.L99.core.O_STREAM_ARCHIVE_QUERY.ts
// OMEGA-64 | O_STREAM_ARCHIVE_QUERY (Lookup)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import type { OStreamArchiveIndex } from "./i.L99.core.O_STREAM_ARCHIVE_INDEX.ts";

export const O_STREAM_ARCHIVE_QUERY = async (
  proposalId: string,
  archivePath: string,
  index: OStreamArchiveIndex,
): Promise<DeltaProposal[]> => {
  const lines = index.by_proposal_id[proposalId] ?? [];
  if (lines.length === 0) return [];
  const raw = await Deno.readTextFile(archivePath).catch(() => "");
  const entries = raw.split("\n");
  const output: DeltaProposal[] = [];
  for (const line of lines) {
    const entry = entries[line];
    if (!entry || !entry.trim()) continue;
    try {
      output.push(JSON.parse(entry) as DeltaProposal);
    } catch {
      // ignore malformed lines
    }
  }
  return output;
};
