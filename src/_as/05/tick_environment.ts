/** SSoT: {@link ../../ontology/physics/tick_environment.md} */
import { GRID_CELLS, ATTENTION_FIELD_OFF, tick_structure_grid, diffuse_viral_semantics, glyph_transport } from "../04/mod";

@inline
export function tick_environment(tick: i32): void {
// 1. Attention Field Decay (90% per tick)
  for (let i = 0; i < (GRID_CELLS as i32); i++) {
    const ptr = ATTENTION_FIELD_OFF + (i << 2) as usize;
    const val = load<f32>(ptr);
    if (val > 0.0) {
      store<f32>(ptr, val * 0.9);
    }
  }

  // 2. Structural Decay & Autopoiesis
  tick_structure_grid();

  // 3. Viral Semantic Diffusion
  diffuse_viral_semantics(tick);

  // 4. Pheromone / Plasmid Diffusion
  glyph_transport(tick);
}
