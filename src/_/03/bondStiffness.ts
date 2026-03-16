// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/bondStiffness.md
import { MAX_ATOMS, STIFFNESS_OFFSET, sharedBuffer, TYPES } from "@g02";

export const bondStiffness = new Float32Array(sharedBuffer, STIFFNESS_OFFSET, MAX_ATOMS * 4);
