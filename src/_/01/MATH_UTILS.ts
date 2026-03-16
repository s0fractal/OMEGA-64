// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/MATH_UTILS.md
import { C_LOG2_C_LUT, TYPES } from "@g00";

export function normalize_angle(angle: number): number {
  const tau = 2 * Math.PI;
  let a = angle % tau;
  if (a < 0) a += tau;
  return a / tau;
}

export function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export function fast_sign(v: number): number {
  return (v >> 31) | ((<number><unknown>-v) >>> 31);
}

export function calculate_shannon_entropy(data: Uint8Array): number {
  // Stub for TS/WASM bridge
  return 0;
}
