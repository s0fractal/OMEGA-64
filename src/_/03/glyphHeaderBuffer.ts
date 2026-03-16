// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/glyphHeaderBuffer.md
import { GRID_CELLS, GLYPH_HEADER_OFFSET, sharedBuffer } from "@g02";

export const glyphHeaderBuffer = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS).buffer;
