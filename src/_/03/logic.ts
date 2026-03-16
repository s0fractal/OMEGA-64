// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/logic.md
import { MAX_ATOMS, ATOM_GENOME_SIZE, LOGIC_OFFSET, sharedBuffer, TYPES } from "@g02";

export const logic = new Uint8Array(sharedBuffer, LOGIC_OFFSET, MAX_ATOMS * ATOM_GENOME_SIZE);
