// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/lineageBuffer.md
import { MAX_ATOMS, LINEAGE_OFFSET, sharedBuffer, TYPES } from "@g02";

export const lineageBuffer = new BigUint64Array(sharedBuffer, LINEAGE_OFFSET, MAX_ATOMS).buffer;
