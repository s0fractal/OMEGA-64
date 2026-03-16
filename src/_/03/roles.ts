// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/roles.md
import { MAX_ATOMS, ROLES_OFFSET, sharedBuffer, TYPES } from "@g02";

export const roles = new Uint8Array(sharedBuffer, ROLES_OFFSET, MAX_ATOMS);
