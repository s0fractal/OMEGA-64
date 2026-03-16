// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/ys.md
import { MAX_ATOMS, YS_OFFSET, sharedBuffer } from "@g02";

export const ys = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS);
