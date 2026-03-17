// SSoT: file:///Users/s0fractal/OMEGA/I/physics/get_glyph_influence.md
import { GRID_W, GRID_H, GLYPH_HEADER_OFF, ROLE_PARASITE, ROLE_GUARDIAN, ROLE_ARCHITECT } from "../01/mod";

@inline
export function get_glyph_influence(gx: i32, gy: i32, role: u8): f32 {
if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
const cell = gy * GRID_W + gx;
const header = atomic.load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
const kind = header & 0xFF;
const amplitude = ((header >>> 8) & 0x00FFFFFF) as f32;
if (amplitude <= 0.0) return 0.0;
const normalized = amplitude / 256.0;

if (kind == 1) { // pheromone packet
  if (role == ROLE_PARASITE) return -normalized * 0.8;
  if (role == ROLE_GUARDIAN) return normalized * 0.4;
  if (role == ROLE_ARCHITECT) return normalized * 0.2;
  return normalized * 0.9;
}

if (kind == 2) { // plasmid packet
  if (role == ROLE_GUARDIAN) return -normalized * 0.45;
  if (role == ROLE_ARCHITECT) return -normalized * 0.2;
  if (role == ROLE_PARASITE) return normalized * 0.75;
  return normalized * 0.3;
}

return 0.0;
}
