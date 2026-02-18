// i.L99.core.O_STREAM_STORE.ts
// OMEGA-64 | O_STREAM_STORE (Facade)

import type { STATE_SNAPSHOT_DeltaProposal as DeltaProposal } from "@omega";
import { O_STREAM_APPEND_O_STREAM_APPEND as O_STREAM_APPEND } from "@omega";
import { O_STREAM_PATH_O_STREAM_PATH as O_STREAM_PATH } from "@omega";
import { O_STREAM_READ_O_STREAM_READ as O_STREAM_READ } from "@omega";

export const O_STREAM_STORE = {
  append: (proposal: DeltaProposal, path: string = O_STREAM_PATH()): Promise<string> =>
    O_STREAM_APPEND(proposal, path),
  read: (path: string = O_STREAM_PATH()): Promise<DeltaProposal[]> =>
    O_STREAM_READ(path),
};
