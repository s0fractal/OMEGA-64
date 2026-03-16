// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/get_glyph_energy.md
import { GLYPH_ENERGY_LUT } from "@g05";

export function get_glyph_energy(id: number): number {
  return GLYPH_ENERGY_LUT[id & 63];
}
