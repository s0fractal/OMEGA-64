// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/instructions.md
import { MAX_ATOMS, ATOM_INSTRUCTION_SIZE, INSTRUCTIONS_OFFSET, sharedBuffer } from "@g02";

export const instructions = new Uint8Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * ATOM_INSTRUCTION_SIZE);
