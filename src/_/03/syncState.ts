// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/syncState.md
import { SYNC_STATE_OFFSET, sharedBuffer, TYPES } from "@g02";

export const syncState = new Int32Array(sharedBuffer, SYNC_STATE_OFFSET, 1);
