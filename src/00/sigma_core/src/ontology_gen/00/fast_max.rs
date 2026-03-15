// SSoT: src/ontology/math/fast_max.md
#![allow(unused_imports)]

pub fn fast_max(a: i32, b: i32) -> i32 {
    let diff = a - b;
    a - (diff & (diff >> 31))
}
