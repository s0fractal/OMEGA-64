// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/coherence.md
import { COHERENCE_OFFSET, sharedBuffer } from "@g02";

export const coherence = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1);
