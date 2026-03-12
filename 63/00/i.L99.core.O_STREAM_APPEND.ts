// i.L99.core.O_STREAM_APPEND.ts
// OMEGA-64 | O_STREAM_APPEND (Append)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";

export const O_STREAM_APPEND = async (
  proposal: DeltaProposal,
  path: string = O_STREAM_PATH(),
): Promise<string> => {
  await Deno.writeTextFile(path, `${JSON.stringify(proposal)}\n`, { append: true });
  return path;
};
