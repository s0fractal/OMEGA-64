// i.L99.core.O_STREAM_READ.ts
// OMEGA-64 | O_STREAM_READ (Read)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";

export const O_STREAM_READ = async (
  path: string = O_STREAM_PATH(),
): Promise<DeltaProposal[]> => {
  const raw = await Deno.readTextFile(path).catch(() => "");
  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as DeltaProposal);
};
