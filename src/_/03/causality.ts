// SSoT: file:///Users/s0fractal/OMEGA/I/memory/causality.md
import { MAX_ATOMS, CAUSALITY_OFFSET, sharedBuffer } from "@g02";

export const causality = new Uint8Array(sharedBuffer, CAUSALITY_OFFSET, MAX_ATOMS);
