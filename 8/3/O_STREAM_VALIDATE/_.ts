// i.L99.core.O_STREAM_VALIDATE.ts
// OMEGA-64 | O_STREAM_VALIDATE (Filter)

import { O_STREAM_SCHEMA } from "../2/O_STREAM_SCHEMA/_.ts";
import type { DeltaProposal } from "../0/STATE_SNAPSHOT/_.ts";

export const O_STREAM_VALIDATE = (proposals: DeltaProposal[]): DeltaProposal[] =>
  proposals.filter((proposal) => O_STREAM_SCHEMA(proposal));
