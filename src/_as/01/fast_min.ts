// SSoT: file:///Users/s0fractal/OMEGA/I/math/fast_min.md

@inline
export function fast_min(a: i32, b: i32): i32 {
const diff = a - b;
return b + (diff & (diff >> 31));
}
