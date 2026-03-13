#![allow(unused_imports)]

pub fn normalize_angle(angle: f64) -> f64 {
    let tau = 2.0 * std::f64::consts::PI;
    let mut a = angle % tau;
    if a < 0.0 {
        a += tau;
    }
    a / tau
}
