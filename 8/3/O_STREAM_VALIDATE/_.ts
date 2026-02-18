// i.L99.core.O_STREAM_VALIDATE.ts
// OMEGA-64 | O_STREAM_VALIDATE (Filter)

import { O_STREAM_SCHEMA_O_STREAM_SCHEMA as O_STREAM_SCHEMA } from "@omega";
import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal } from "@omega";

export const O_STREAM_VALIDATE = (proposals: DeltaProposal[]): DeltaProposal[] =>
  proposals.filter((proposal) => O_STREAM_SCHEMA(proposal));
