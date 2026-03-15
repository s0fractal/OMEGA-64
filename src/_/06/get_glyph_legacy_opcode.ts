// SSoT: src/ontology/core/get_glyph_legacy_opcode.md

import { GLYPH_LEGACY_OPCODE_LUT } from "../00/mod.ts";

export function get_glyph_legacy_opcode(id: number): number {
  return GLYPH_LEGACY_OPCODE_LUT[id & 63];
}
