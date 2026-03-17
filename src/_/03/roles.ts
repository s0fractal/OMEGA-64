// SSoT: file:///Users/s0fractal/OMEGA/I/memory/roles.md
import { MAX_ATOMS, ROLES_OFFSET, sharedBuffer } from "@g02";

export const roles = new Uint8Array(sharedBuffer, ROLES_OFFSET, MAX_ATOMS);
