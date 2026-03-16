// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/structureGrid.md
import { GRID_CELLS, STRUCTURE_GRID_OFFSET, sharedBuffer, TYPES } from "@g02";

export const structureGrid = new Int32Array(sharedBuffer, STRUCTURE_GRID_OFFSET, GRID_CELLS);
