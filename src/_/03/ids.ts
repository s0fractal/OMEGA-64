// SSoT: file:///Users/s0fractal/OMEGA/I/memory/ids.md
import { MAX_ATOMS, IDS_OFFSET, sharedBuffer } from "@g02";

export const ids = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS);
