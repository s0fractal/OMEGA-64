// SSoT: src/ontology/math/normalize_angle.md

@inline
export function normalize_angle(angle: f64): f64 {
const tau: f64 = 2.0 * Math.PI;
let a: f64 = angle % tau;
if (a < 0.0) a += tau;
return a / tau;
}
