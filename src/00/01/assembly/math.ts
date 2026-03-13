// deno-lint-ignore-file
// @ts-nocheck
import { SIN_LUT, COS_LUT } from "./constants.assembly";

export function math_sin(angle: i32, highRes: i32): i32 {
  if (highRes == 0) {
    let idx = angle & 255;
    return SIN_LUT[idx] as i32;
  }
  let idx = (angle >> 8) & 255;
  let frac = angle & 255;
  if (highRes == 1) { // LERP
    let v0 = SIN_LUT[idx] as i32;
    let v1 = SIN_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
  }
  // TAYLOR2
  let s_base = SIN_LUT[idx] as i32;
  let c_base = COS_LUT[idx] as i32;
  let d1 = (c_base * 804) >> 15;
  let term1 = (d1 * frac) >> 8;
  let d2 = (s_base * 10) >> 15;
  let term2 = (d2 * frac * frac) >> 16;
  return s_base + term1 - term2;
}

export function math_cos(angle: i32, highRes: i32): i32 {
  if (highRes == 0) {
    let idx = angle & 255;
    return COS_LUT[idx] as i32;
  }
  let idx = (angle >> 8) & 255;
  let frac = angle & 255;
  if (highRes == 1) { // LERP
    let v0 = COS_LUT[idx] as i32;
    let v1 = COS_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
  }
  // TAYLOR2
  let s_base = SIN_LUT[idx] as i32;
  let c_base = COS_LUT[idx] as i32;
  let d1 = (s_base * 804) >> 15;
  let term1 = (d1 * frac) >> 8;
  let d2 = (c_base * 10) >> 15;
  let term2 = (d2 * frac * frac) >> 16;
  return c_base - term1 - term2;
}

// --- Fast Integer Math Helpers ---

@inline
export function fast_abs(v: i32): i32 {
  const mask = v >> 31;
  return (v + mask) ^ mask;
}

@inline
export function fast_min(a: i32, b: i32): i32 {
  const diff = a - b;
  return b + (diff & (diff >> 31));
}

@inline
export function fast_max(a: i32, b: i32): i32 {
  const diff = a - b;
  return a - (diff & (diff >> 31));
}

@inline
export function fast_sign(v: i32): i32 {
  return (v >> 31) | (<i32>(<u32>-v) >>> 31);
}
