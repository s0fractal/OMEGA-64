// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/tickCounter.md
import { TICK_COUNTER_OFFSET, sharedBuffer, TYPES } from "@g02";

export const tickCounter = new Int32Array(sharedBuffer, TICK_COUNTER_OFFSET, 1);
