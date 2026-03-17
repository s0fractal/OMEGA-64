// SSoT: file:///Users/s0fractal/OMEGA/I/memory/neuralCoherence.md
import { NEURAL_COHERENCE_OFFSET, sharedBuffer } from "@g02";

export const neuralCoherence = new Int32Array(sharedBuffer, NEURAL_COHERENCE_OFFSET, 1);
