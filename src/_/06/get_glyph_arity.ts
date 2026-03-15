// SSoT: src/ontology/core/get_glyph_arity.md

import { GLYPH_ARITY_LUT } from "../00/mod.ts";

export function get_glyph_arity(id: number): number {
  return GLYPH_ARITY_LUT[id & 63];
}
