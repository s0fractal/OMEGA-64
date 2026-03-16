// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/bonds.md
import { MAX_ATOMS, BONDS_OFFSET, sharedBuffer, TYPES } from "@g02";

export const bonds = new Uint32Array(sharedBuffer, BONDS_OFFSET, MAX_ATOMS * 4);
