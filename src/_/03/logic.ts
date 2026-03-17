// SSoT: file:///Users/s0fractal/OMEGA/I/memory/logic.md
import { MAX_ATOMS, ATOM_GENOME_SIZE, LOGIC_OFFSET, sharedBuffer } from "@g02";

export const logic = new Uint8Array(sharedBuffer, LOGIC_OFFSET, MAX_ATOMS * ATOM_GENOME_SIZE);
