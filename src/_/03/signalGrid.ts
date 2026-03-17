// SSoT: file:///Users/s0fractal/OMEGA/I/memory/signalGrid.md
import { GRID_CELLS, SIGNAL_GRID_OFFSET, sharedBuffer } from "@g02";

export const signalGrid = new Int32Array(sharedBuffer, SIGNAL_GRID_OFFSET, GRID_CELLS);
