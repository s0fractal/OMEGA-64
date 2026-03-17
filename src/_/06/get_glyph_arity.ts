// SSoT: file:///Users/s0fractal/OMEGA/I/core/get_glyph_arity.md
import { GLYPH_ARITY_LUT } from "@g05";

export function get_glyph_arity(id: number): number {
  return GLYPH_ARITY_LUT[id & 63];
}
