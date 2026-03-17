// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/get_glyph_kind.md
import { KIND_CONTROL, KIND_CORE, GLYPH_TYPES } from "@g05";

export function get_glyph_kind(id: number): number {
  if (id <= 3) return KIND_CORE;
  if (id <= 15) return KIND_CONTROL;
  return id >> 3;
}
