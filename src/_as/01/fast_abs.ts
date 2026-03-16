// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/fast_abs.md

@inline
export function fast_abs(v: i32): i32 {
const mask = v >> 31;
return (v + mask) ^ mask;
}
