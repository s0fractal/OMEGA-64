// SSoT: file:///Users/s0fractal/OMEGA/I/memory/bondDistBuffer.md
import { MAX_ATOMS, BOND_DISTANCES_OFFSET, sharedBuffer } from "@g02";

export const bondDistBuffer = new Uint8Array(sharedBuffer, BOND_DISTANCES_OFFSET, MAX_ATOMS * 4).buffer;
