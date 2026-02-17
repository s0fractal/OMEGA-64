// i.L99.core.O_STREAM_APPEND.ts
// OMEGA-64 | O_STREAM_APPEND (Append)

import type { DeltaProposal } from "../0/STATE_SNAPSHOT/_.ts";
import { O_STREAM_PATH } from "../6/O_STREAM_PATH/_.ts";

export const O_STREAM_APPEND = async (
  proposal: DeltaProposal,
  path: string = O_STREAM_PATH(),
): Promise<string> => {
  await Deno.writeTextFile(path, `${JSON.stringify(proposal)}\n`, { append: true });
  return path;
};
