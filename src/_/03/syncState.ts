// SSoT: file:///Users/s0fractal/OMEGA/I/memory/syncState.md
import { SYNC_STATE_OFFSET, sharedBuffer } from "@g02";

export const syncState = new Int32Array(sharedBuffer, SYNC_STATE_OFFSET, 1);
