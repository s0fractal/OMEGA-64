// SSoT: file:///Users/s0fractal/OMEGA/I/memory/xs.md
import { MAX_ATOMS, XS_OFFSET, sharedBuffer } from "@g02";

export const xs = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS);
