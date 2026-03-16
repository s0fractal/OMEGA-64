// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/dampingBuffer.md
import { MAX_ATOMS, DAMPING_OFFSET, sharedBuffer, TYPES } from "@g02";

export const dampingBuffer = new Uint8Array(sharedBuffer, DAMPING_OFFSET, MAX_ATOMS).buffer;
