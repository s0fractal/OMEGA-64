// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/diffusion_share_for_kind.md
import { fast_abs } from "../01/mod";

@inline
export function diffusion_share_for_kind(kind: i32, amplitude: i32): i32 {
const absAmp = fast_abs(amplitude);
let shareAmt = 0;
if (kind == 2) { // PLASMID
  shareAmt = absAmp >= 96 ? (absAmp >> 3) : 0; // * 0.125
} else if (kind == 1) { // PHEROMONE
  shareAmt = absAmp >= 24 ? (absAmp >> 2) : 0; // * 0.25
}
return amplitude > 0 ? shareAmt : -shareAmt;
}
