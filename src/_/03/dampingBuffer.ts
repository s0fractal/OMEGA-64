// SSoT: file:///Users/s0fractal/OMEGA/I/memory/dampingBuffer.md
import { MAX_ATOMS, DAMPING_OFFSET, sharedBuffer } from "@g02";

export const dampingBuffer = new Uint8Array(sharedBuffer, DAMPING_OFFSET, MAX_ATOMS).buffer;
