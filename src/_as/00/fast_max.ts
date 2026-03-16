// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/fast_max.md

@inline
export function fast_max(a: i32, b: i32): i32 {
const diff = a - b;
return a - (diff & (diff >> 31));
}
