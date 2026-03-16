// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/bondDistances.md
import { MAX_ATOMS, BOND_DISTANCES_OFFSET, sharedBuffer, TYPES } from "@g02";

export const bondDistances = new Uint8Array(sharedBuffer, BOND_DISTANCES_OFFSET, MAX_ATOMS * 4);
