// i.L99.core.O_STREAM_STORE.ts
// OMEGA-64 | O_STREAM_STORE (Facade)

import type { DeltaProposal } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { O_STREAM_APPEND } from "./i.L99.core.O_STREAM_APPEND.ts";
import { O_STREAM_PATH } from "./i.L99.core.O_STREAM_PATH.ts";
import { O_STREAM_READ } from "./i.L99.core.O_STREAM_READ.ts";

export const O_STREAM_STORE = {
  append: (proposal: DeltaProposal, path: string = O_STREAM_PATH()): Promise<string> =>
    O_STREAM_APPEND(proposal, path),
  read: (path: string = O_STREAM_PATH()): Promise<DeltaProposal[]> =>
    O_STREAM_READ(path),
};
