// SSoT: file:///Users/s0fractal/OMEGA/I/memory/hormoneBuffer.md
import { MAX_HORMONES, HORMONE_OFFSET, sharedBuffer } from "@g02";

export const hormoneBuffer = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES).buffer;
