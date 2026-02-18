// i.L99.core.O_STREAM_ADAPTER.ts
// OMEGA-64 | O_STREAM_ADAPTER (O → DeltaProposal[])

import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal } from "@omega";

export type OStream = DeltaProposal[];

export const O_STREAM_ADAPTER = (stream: OStream): DeltaProposal[] => stream.slice();
