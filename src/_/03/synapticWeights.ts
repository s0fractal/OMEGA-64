// SSoT: file:///Users/s0fractal/OMEGA/I/memory/synapticWeights.md
import { MAX_ATOMS, SYNAPTIC_WEIGHTS_OFFSET, sharedBuffer } from "@g02";

export const synapticWeights = new Uint8Array(sharedBuffer, SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4);
