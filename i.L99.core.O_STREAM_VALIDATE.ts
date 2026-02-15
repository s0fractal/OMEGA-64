// i.L99.core.O_STREAM_VALIDATE.ts
// OMEGA-64 | O_STREAM_VALIDATE (Filter)

import { O_STREAM_SCHEMA } from "./i.L99.core.O_STREAM_SCHEMA.ts";
import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

export const O_STREAM_VALIDATE = (proposals: DeltaProposal[]): DeltaProposal[] =>
  proposals.filter((proposal) => O_STREAM_SCHEMA(proposal));
