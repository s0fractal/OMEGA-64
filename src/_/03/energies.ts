// SSoT: file:///Users/s0fractal/OMEGA/I/memory/energies.md
import { MAX_ATOMS, ENERGY_OFFSET, sharedBuffer } from "@g02";

export const energies = new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS);
