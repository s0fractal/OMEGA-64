// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/bondRequests.md
import { MAX_ATOMS, BOND_REQUESTS_OFFSET, sharedBuffer, TYPES } from "@g02";

export const bondRequests = new Int32Array(sharedBuffer, BOND_REQUESTS_OFFSET, MAX_ATOMS * 3);
