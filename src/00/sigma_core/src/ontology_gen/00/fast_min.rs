#![allow(unused_imports)]

pub fn fast_min(a: i32, b: i32) -> i32 {
    let diff = a - b;
    b + (diff & (diff >> 31))
}
