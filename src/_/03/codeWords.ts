// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/codeWords.md
import { MAX_ATOMS, INSTRUCTIONS_OFFSET, sharedBuffer, TYPES } from "@g02";

export const codeWords = new Uint32Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * 16);
