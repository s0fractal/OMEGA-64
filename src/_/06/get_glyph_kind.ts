// SSoT: src/ontology/core/get_glyph_kind.md

import { KIND_CORE, KIND_CONTROL } from "../00/mod.ts";

export function get_glyph_kind(id: number): number {
  if (id <= 3) return KIND_CORE;
  if (id <= 15) return KIND_CONTROL;
  return id >> 3;
}
