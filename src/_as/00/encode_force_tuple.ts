// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/encode_force_tuple.md

@inline
export function encode_force_tuple(fx: f32, fy: f32): void {
// Reinterpret cast f32 -> i32 then pack into i64
const xInt = reinterpret<i32>(fx);
const yInt = reinterpret<i32>(fy);
return ((xInt as i64) << 32) | ((yInt as i64) & 0xFFFFFFFF);
}
