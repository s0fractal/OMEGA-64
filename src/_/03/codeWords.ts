// SSoT: file:///Users/s0fractal/OMEGA/I/memory/codeWords.md
import { MAX_ATOMS, INSTRUCTIONS_OFFSET, sharedBuffer } from "@g02";

export const codeWords = new Uint32Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * 16);
