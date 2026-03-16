// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/MATH_UTILS.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn normalize_angle(angle: f64) -> f64 {
    let tau = 2.0 * std::f64::consts::PI;
    let mut a = angle % tau;
    if a < 0.0 {
        a += tau;
    }
    a / tau
}

pub fn clamp01(x: f64) -> f64 {
    if x < 0.0 {
        0.0
    } else if x > 1.0 {
        1.0
    } else {
        x
    }
}

pub fn fast_sign(v: i32) -> i32 {
    (v >> 31) | ((-v as u32) >> 31) as i32
}

pub fn calculate_shannon_entropy(data: &[u8; 64]) -> i32 {
    let mut counts = [0i32; 256];
    for &b in data.iter() {
        counts[b as usize] += 1;
    }

    let mut sum_c_log_c = 0;
    for &c in counts.iter() {
        if c > 0 {
            sum_c_log_c += C_LOG2_C_LUT[c as usize];
        }
    }

    let mut entropy = 6000 - (sum_c_log_c >> 6);
    
    if entropy < 0 {
        entropy = 0;
    } else if entropy > 6000 {
        entropy = 6000;
    }
    
    entropy
}
