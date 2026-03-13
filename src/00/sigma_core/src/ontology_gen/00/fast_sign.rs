
pub fn fast_sign(v: i32) -> i32 {
    (v >> 31) | ((-v as u32) >> 31) as i32
}
