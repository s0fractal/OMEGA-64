// i.L99.core.O_STREAM_APPEND.ts
// OMEGA-64 | O_STREAM_APPEND (Append)

import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal } from "@omega";
import { O_STREAM_PATH_O_STREAM_PATH as O_STREAM_PATH } from "@omega";

export const O_STREAM_APPEND = async (
  proposal: DeltaProposal,
  path: string = O_STREAM_PATH(),
): Promise<string> => {
  await Deno.writeTextFile(path, `${JSON.stringify(proposal)}\n`, { append: true });
  return path;
};
