// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/get_attention_cell.md
import { GRID_W, GRID_H, ATTENTION_FIELD_OFF } from "../01/mod";

@inline
export function get_attention_cell(gx: i32, gy: i32): f32 {
if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
return load<f32>(ATTENTION_FIELD_OFF + ((gy * GRID_W + gx) << 2) as usize);
}
