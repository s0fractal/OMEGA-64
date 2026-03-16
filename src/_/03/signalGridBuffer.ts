// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/signalGridBuffer.md
import { GRID_CELLS, SIGNAL_GRID_OFFSET, sharedBuffer, TYPES } from "@g02";

export const signalGridBuffer = new Int32Array(sharedBuffer, SIGNAL_GRID_OFFSET, GRID_CELLS).buffer;
