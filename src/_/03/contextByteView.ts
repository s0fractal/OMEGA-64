// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/contextByteView.md
import { MAX_ATOMS, ATOM_CONTEXT_SIZE, CONTEXT_OFFSET, sharedBuffer, TYPES } from "@g02";

export const contextByteView = new Uint8Array(sharedBuffer, CONTEXT_OFFSET, MAX_ATOMS * (ATOM_CONTEXT_SIZE * 4));
