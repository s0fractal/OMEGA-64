// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/glyphHeaders.md
import { GRID_CELLS, GLYPH_HEADER_OFFSET, sharedBuffer, TYPES } from "@g02";

export const glyphHeaders = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS);
