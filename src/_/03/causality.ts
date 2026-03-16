// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/causality.md
import { MAX_ATOMS, CAUSALITY_OFFSET, sharedBuffer, TYPES } from "@g02";

export const causality = new Uint8Array(sharedBuffer, CAUSALITY_OFFSET, MAX_ATOMS);
