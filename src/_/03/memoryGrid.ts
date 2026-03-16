// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/memoryGrid.md
import { GRID_CELLS, MEMORY_GRID_OFFSET, sharedBuffer } from "@g02";

export const memoryGrid = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8);
