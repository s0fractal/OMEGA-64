// SSoT: file:///Users/s0fractal/OMEGA/I/memory/contexts.md
import { MAX_ATOMS, ATOM_CONTEXT_SIZE, CONTEXT_OFFSET, sharedBuffer } from "@g02";

export const contexts = new Int32Array(sharedBuffer, CONTEXT_OFFSET, MAX_ATOMS * ATOM_CONTEXT_SIZE);
