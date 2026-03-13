
pub fn fast_abs(v: i32) -> i32 {
    let mask = v >> 31;
    (v + mask) ^ mask
}
