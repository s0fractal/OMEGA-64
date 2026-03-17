// SSoT: file:///Users/s0fractal/OMEGA/I/memory/phases.md
import { MAX_ATOMS, PHASE_OFFSET, sharedBuffer } from "@g02";

export const phases = new Int32Array(sharedBuffer, PHASE_OFFSET, MAX_ATOMS);
