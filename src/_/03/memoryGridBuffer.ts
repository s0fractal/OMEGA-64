// SSoT: file:///Users/s0fractal/OMEGA/I/memory/memoryGridBuffer.md
import { GRID_CELLS, MEMORY_GRID_OFFSET, sharedBuffer } from "@g02";

export const memoryGridBuffer = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8).buffer;
