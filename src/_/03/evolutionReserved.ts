// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/evolutionReserved.md
import { MAX_ATOMS, EVOLUTION_OFFSET, sharedBuffer, TYPES } from "@g02";

export const evolutionReserved = new Int32Array(sharedBuffer, EVOLUTION_OFFSET, MAX_ATOMS);
