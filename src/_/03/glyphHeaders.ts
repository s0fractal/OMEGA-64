// SSoT: file:///Users/s0fractal/OMEGA/I/memory/glyphHeaders.md
import { GRID_CELLS, GLYPH_HEADER_OFFSET, sharedBuffer } from "@g02";

export const glyphHeaders = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS);
