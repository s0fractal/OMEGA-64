// SSoT: file:///Users/s0fractal/OMEGA/I/math/math_cos.md
import { SIN_LUT, COS_LUT } from "../00/mod";

@inline
export function math_cos(angle: i32, highRes: i32): i32 {
if (highRes == 0) {
    let idx = angle & 255;
    return COS_LUT[idx] as i32;
}
let idx = (angle >> 8) & 255;
let frac = angle & 255;

if (highRes == 1) {
    let v0 = COS_LUT[idx] as i32;
    let v1 = COS_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
}

let s_base = SIN_LUT[idx] as i32;
let c_base = COS_LUT[idx] as i32;
let d1 = (s_base * 804) >> 15;
let term1 = (d1 * frac) >> 8;
let d2 = (c_base * 10) >> 15;
let term2 = (d2 * frac * frac) >> 16;
return c_base - term1 - term2;
}
