// i.L99.core.O_STREAM_STORE.ts
// OMEGA-64 | O_STREAM_STORE (Facade)

import type { DeltaProposal } from "../0/STATE_SNAPSHOT/_.ts";
import { O_STREAM_APPEND } from "../1/O_STREAM_APPEND/_.ts";
import { O_STREAM_PATH } from "../O_STREAM_PATH/_.ts";
import { O_STREAM_READ } from "../5/O_STREAM_READ/_.ts";

export const O_STREAM_STORE = {
  append: (proposal: DeltaProposal, path: string = O_STREAM_PATH()): Promise<string> =>
    O_STREAM_APPEND(proposal, path),
  read: (path: string = O_STREAM_PATH()): Promise<DeltaProposal[]> =>
    O_STREAM_READ(path),
};
