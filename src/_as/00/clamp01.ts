/** SSoT: {@link ../../ontology/math/clamp01.md} */

@inline
export function clamp01(x: f64): f64 {
if (x < 0.0) return 0.0;
if (x > 1.0) return 1.0;
return x;
}
