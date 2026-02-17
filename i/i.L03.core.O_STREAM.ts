// i.L03.core.O_STREAM.ts
// OMEGA-64 | O_STREAM (Append-Only Output)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";

export type OStream = DeltaProposal[];

export const O_STREAM = (stream: OStream, proposal: DeltaProposal): OStream => [
  ...stream,
  proposal,
];
