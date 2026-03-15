// SSoT: src/ontology/math/clamp01.md
#![allow(unused_imports)]

pub fn clamp01(x: f64) -> f64 {
    if x < 0.0 {
        0.0
    } else if x > 1.0 {
        1.0
    } else {
        x
    }
}
