#![allow(unused_imports)]

pub fn prng_next(state: u32) -> u32 {
    state.wrapping_mul(1664525).wrapping_add(1013904223)
}
