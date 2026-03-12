// i.L99.core.O_STREAM_READ.ts
// OMEGA-64 | O_STREAM_READ (Read)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";
import { O_STREAM_VALIDATE } from "./i.L99.core.O_STREAM_VALIDATE.ts";
import { O_STREAM_TAG_ENFORCE } from "./i.L99.core.O_STREAM_TAG_ENFORCE.ts";
import { O_STREAM_TAG_POLICY } from "./i.L99.core.O_STREAM_TAG_POLICY.ts";

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
