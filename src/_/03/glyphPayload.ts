// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/glyphPayload.md
import { GRID_CELLS, GLYPH_PAYLOAD_OFFSET, sharedBuffer, TYPES } from "@g02";

export const glyphPayload = new Uint8Array(sharedBuffer, GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8);
