// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/xs.md
import { MAX_ATOMS, XS_OFFSET, sharedBuffer, TYPES } from "@g02";

export const xs = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS);
