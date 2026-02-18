// i.L99.core.O_STREAM_READ.ts
// OMEGA-64 | O_STREAM_READ (Read)

import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal } from "@omega";
import { O_STREAM_PATH_O_STREAM_PATH as O_STREAM_PATH } from "@omega";
import { O_STREAM_VALIDATE_O_STREAM_VALIDATE as O_STREAM_VALIDATE } from "@omega";
import { O_STREAM_TAG_ENFORCE_O_STREAM_TAG_ENFORCE as O_STREAM_TAG_ENFORCE } from "@omega";
import { O_STREAM_TAG_POLICY_O_STREAM_TAG_POLICY as O_STREAM_TAG_POLICY } from "@omega";

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
