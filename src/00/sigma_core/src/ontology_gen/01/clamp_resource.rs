// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/clamp_resource.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn clamp_resource(value: i64) -> i32 {
    if value < 0 {
        0
    } else if value > (RESOURCE_MAX as i64) {
        RESOURCE_MAX as i32
    } else {
        value as i32
    }
}
