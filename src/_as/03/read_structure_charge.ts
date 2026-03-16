// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/read_structure_charge.md
import { STRUCTURE_CHARGE_INTENT_OFF, read_structure_cell } from "../02/mod";

@inline
export function read_structure_charge(cellIdx: i32): i32 {
const cellVal = read_structure_cell(cellIdx);
const baseCharge = (cellVal >> 16) & 0xFF;
const intentCharge = atomic.load<i32>(
  STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize,
);
return intentCharge > baseCharge ? intentCharge : baseCharge;
}
