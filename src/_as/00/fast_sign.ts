// SSoT: src/ontology/math/fast_sign.md

@inline
export function fast_sign(v: i32): i32 {
return (v >> 31) | (<i32>(<u32>-v) >>> 31);
}
