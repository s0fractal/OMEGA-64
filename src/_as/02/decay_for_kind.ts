// SSoT: file:///Users/s0fractal/OMEGA/I/autopoiesis/decay_for_kind.md
import { fast_abs } from "../01/mod";

@inline
export function decay_for_kind(kind: i32, amplitude: i32): i32 {
const absAmp = fast_abs(amplitude);
let decayAmt = 0;
if (kind == 2) { // PLASMID
  decayAmt = absAmp > 256 ? 3 : 1;
} else if (kind == 1) { // PHEROMONE
  decayAmt = absAmp > 64 ? 8 : 4;
} else {
  decayAmt = absAmp; // Fallback
}
return amplitude > 0 ? decayAmt : -decayAmt;
}
