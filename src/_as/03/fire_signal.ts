// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/fire_signal.md
import { MAX_ATOMS, get_bond_target, get_bond_stiffness, add_resonance_delta } from "../02/mod";

@inline
export function fire_signal(idx: i32): void {
for (let b = 0; b < 4; b++) {
  let target = get_bond_target(idx, b);
  if (target > 0 && target < MAX_ATOMS) {
    let st = get_bond_stiffness(idx, b);
    let signalStrength = (150.0 * st) as i32; // Increased to ensure cascade
    add_resonance_delta(target, signalStrength);
  }
}
}
