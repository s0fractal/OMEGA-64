// SSoT: file:///Users/s0fractal/OMEGA/I/memory/spatialGrid.md
import { GRID_CELLS, SPATIAL_GRID_OFFSET, sharedBuffer } from "@g02";

export const spatialGrid = new Int32Array(sharedBuffer, SPATIAL_GRID_OFFSET, GRID_CELLS * 32);
