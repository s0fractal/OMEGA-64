// SSoT: src/ontology/spatial/store_clamped_pos.md
import { XS_OFFSET, YS_OFFSET, clamp_world_x, clamp_world_y } from "../01/mod";

@inline
export function store_clamped_pos(idx: i32, x: i32, y: i32): void {
store<i16>(XS_OFFSET + (<usize>idx << 1), <i16>clamp_world_x(x));
store<i16>(YS_OFFSET + (<usize>idx << 1), <i16>clamp_world_y(y));
}
