// SSoT: src/ontology/physics/get_genome_velocity_y.md
import { get_logic_byte } from "../02/mod";

@inline
export function get_genome_velocity_y(idx: i32): i32 {
let vy: i32 = 0;
for (let b = 2; b < 4; b++) {
  let byte = get_logic_byte(idx, b);
  let hi = (byte >> 4) as i32;
  if (hi != 0) vy += (hi > 7 ? hi - 7 : hi - 8) * 3;
  let lo = (byte & 0x0F) as i32;
  if (lo != 0) vy += (lo > 7 ? lo - 7 : lo - 8) * 3;
}
return vy;
}
