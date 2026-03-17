// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/stiffnessBuffer.md
import { MAX_ATOMS, STIFFNESS_OFFSET, sharedBuffer } from "@g02";

export const stiffnessBuffer = new Float32Array(sharedBuffer, STIFFNESS_OFFSET, MAX_ATOMS * 4).buffer;
