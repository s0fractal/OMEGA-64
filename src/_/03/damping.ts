// SSoT: file:///Users/s0fractal/OMEGA/I/memory/damping.md
import { MAX_ATOMS, DAMPING_OFFSET, sharedBuffer } from "@g02";

export const damping = new Uint8Array(sharedBuffer, DAMPING_OFFSET, MAX_ATOMS);
