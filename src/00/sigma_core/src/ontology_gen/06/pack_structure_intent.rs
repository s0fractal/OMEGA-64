#![allow(unused_imports)]
use super::super::L05::*;

pub fn pack_structure_intent(target_type: u32, target_value: u32, locked: bool) -> i32 {
    let mut intent: u32 = target_type | (target_value << 24);
    if locked {
        intent |= 0x80000000;
    }
    intent as i32
}
