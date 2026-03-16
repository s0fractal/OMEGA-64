// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/ids.md
import { MAX_ATOMS, IDS_OFFSET, sharedBuffer, TYPES } from "@g02";

export const ids = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS);
