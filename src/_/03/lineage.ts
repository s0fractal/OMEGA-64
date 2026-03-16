// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/lineage.md
import { MAX_ATOMS, LINEAGE_OFFSET, sharedBuffer } from "@g02";

export const lineage = new BigUint64Array(sharedBuffer, LINEAGE_OFFSET, MAX_ATOMS);
