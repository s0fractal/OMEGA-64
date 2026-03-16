// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/resonances.md
import { MAX_ATOMS, RESONANCE_OFFSET, sharedBuffer, TYPES } from "@g02";

export const resonances = new Int32Array(sharedBuffer, RESONANCE_OFFSET, MAX_ATOMS);
