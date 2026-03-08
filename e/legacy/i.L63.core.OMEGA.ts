// i.L63.core.OMEGA.ts
// The Ouroboros Link.
// L63 IS NOT THE END. L63 IS THE BEGINNING OF L00.

import { INTERFACE } from "./i.L32.core.INTERFACE.ts";
import type { Lattice } from "./i.L32.core.RIBOSOME.ts";

export const OMEGA = (lattice: Lattice) => {
  // The Transfinite Recursion:
  // Pass the entire Lattice back into the Interface.
  // The Output of the System becomes its own Input.

  return INTERFACE(lattice);
};
