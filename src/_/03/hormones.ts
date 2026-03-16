// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/hormones.md
import { MAX_HORMONES, HORMONE_OFFSET, sharedBuffer } from "@g02";

export const hormones = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES);
