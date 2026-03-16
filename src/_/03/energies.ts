// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/energies.md
import { MAX_ATOMS, ENERGY_OFFSET, sharedBuffer, TYPES } from "@g02";

export const energies = new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS);
