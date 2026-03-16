// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/hormoneBuffer.md
import { MAX_HORMONES, HORMONE_OFFSET, sharedBuffer, TYPES } from "@g02";

export const hormoneBuffer = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES).buffer;
