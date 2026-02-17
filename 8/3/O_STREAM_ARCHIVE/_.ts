// i.L99.core.O_STREAM_ARCHIVE.ts
// OMEGA-64 | O_STREAM_ARCHIVE (Preserve)

import type { DeltaProposal } from "../0/STATE_SNAPSHOT/_.ts";

export const O_STREAM_ARCHIVE = async (
  proposals: DeltaProposal[],
  archivePath: string,
): Promise<string> => {
  if (proposals.length === 0) return archivePath;
  const payload = proposals.map((proposal) => JSON.stringify(proposal)).join("\n");
  await Deno.writeTextFile(archivePath, `${payload}\n`, { append: true });
  return archivePath;
};
