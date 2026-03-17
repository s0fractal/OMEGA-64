// SSoT: file:///Users/s0fractal/OMEGA/I/physics/apply_bond_springs.md
import { DAMPING_OFF, MAX_ATOMS, BOND_DISTANCES_OFFSET, get_bond_target, get_bond_stiffness, get_read_x, get_read_y, get_read_resonance, add_resonance_delta, encode_force_tuple } from "../02/mod";

@inline
export function apply_bond_springs(idx: i32, x: i32, y: i32): void {
let fx: f32 = 0;
let fy: f32 = 0;
let damping = load<u8>(DAMPING_OFF + idx as usize);

for (let b = 0; b < 4; b++) {
  let targetIdx = get_bond_target(idx, b);
  if (targetIdx == 0 || targetIdx >= MAX_ATOMS) continue;

  let targetDist = load<u8>(BOND_DISTANCES_OFFSET + (idx << 2) + b as usize);
  if (targetDist == 0) targetDist = 50;

  let stiffness = get_bond_stiffness(idx, b);
  let pX = get_read_x(targetIdx) as f32;
  let pY = get_read_y(targetIdx) as f32;
  let dx = pX - (x as f32);
  let dy = pY - (y as f32);
  let dist = Mathf.sqrt(dx * dx + dy * dy);
  if (dist < 1.0) dist = 1.0;

  // --- Stage 9.1: Resonance-Weighted Stiffness & Symbiosis ---
  let myRes = get_read_resonance(idx);
  let targetRes = get_read_resonance(targetIdx);

  // 1. Resonance Synchronization: Equalize resonance between bonded partners (5% flow)
  if (targetRes > myRes) {
    add_resonance_delta(idx, (targetRes - myRes) / 20);
  } else if (myRes > targetRes) {
    add_resonance_delta(idx, -((myRes - targetRes) / 20));
  }

  // 2. Resonance-Weighted Stiffness: Bonds are stronger if atoms are synchronized
  let sumRes: f32 = (myRes as f32) + (targetRes as f32);
  let resonanceWeight: f32 = sumRes / 600.0;
  if (resonanceWeight < 0.5) resonanceWeight = 0.5;
  if (resonanceWeight > 2.0) resonanceWeight = 2.0;

  if (stiffness > 0.8) {
    let force = (dist - (targetDist as f32)) * 1.5 * resonanceWeight;
    fx += (dx / dist) * force;
    fy += (dy / dist) * force;
  } else {
    let elasticRange: f32 = 10.0;
    if (dist > (targetDist as f32) + elasticRange) {
      let force = (dist - ((targetDist as f32) + elasticRange)) * 0.1 *
        resonanceWeight;
      fx += (dx / dist) * force;
      fy += (dy / dist) * force;
    } else if (dist < (targetDist as f32) - elasticRange) {
      let force = (((targetDist as f32) - elasticRange) - dist) * 0.2 *
        resonanceWeight;
      fx -= (dx / dist) * force;
      fy -= (dy / dist) * force;
    }
  }
}

if (damping > 0) {
  let dampingFactor = Mathf.max(0, 1.0 - ((damping as f32) / 255.0));
  fx *= dampingFactor;
  fy *= dampingFactor;
}

return encode_force_tuple(fx, fy);
}
