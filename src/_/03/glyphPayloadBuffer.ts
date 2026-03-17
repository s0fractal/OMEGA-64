// SSoT: file:///Users/s0fractal/OMEGA/I/memory/glyphPayloadBuffer.md
import { GRID_CELLS, GLYPH_PAYLOAD_OFFSET, sharedBuffer } from "@g02";

export const glyphPayloadBuffer = new Uint8Array(sharedBuffer, GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8).buffer;
