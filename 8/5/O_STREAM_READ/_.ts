// i.L99.core.O_STREAM_READ.ts
// OMEGA-64 | O_STREAM_READ (Read)

import type { DeltaProposal } from "../0/STATE_SNAPSHOT/_.ts";
import { O_STREAM_PATH } from "../6/O_STREAM_PATH/_.ts";
import { O_STREAM_VALIDATE } from "../3/O_STREAM_VALIDATE/_.ts";
import { O_STREAM_TAG_ENFORCE } from "../6/O_STREAM_TAG_ENFORCE/_.ts";
import { O_STREAM_TAG_POLICY } from "../4/O_STREAM_TAG_POLICY/_.ts";

export const O_STREAM_READ = async (
  path: string = O_STREAM_PATH(),
  enforceTags: boolean = true,
): Promise<DeltaProposal[]> => {
  const raw = await Deno.readTextFile(path).catch(() => "");
  const parsed = raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as DeltaProposal);
  const validated = O_STREAM_VALIDATE(parsed);
  if (!enforceTags) return validated;
  return O_STREAM_TAG_ENFORCE(validated, O_STREAM_TAG_POLICY());
};
