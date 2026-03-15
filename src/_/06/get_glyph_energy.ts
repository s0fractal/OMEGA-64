// SSoT: src/ontology/core/get_glyph_energy.md

import { GLYPH_ENERGY_LUT } from "../00/mod.ts";

export function get_glyph_energy(id: number): number {
  return GLYPH_ENERGY_LUT[id & 63];
}
