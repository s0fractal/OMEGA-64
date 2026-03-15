// SSoT: src/ontology/math/fast_abs.md
#![allow(unused_imports)]

pub fn fast_abs(v: i32) -> i32 {
    let mask = v >> 31;
    (v + mask) ^ mask
}
