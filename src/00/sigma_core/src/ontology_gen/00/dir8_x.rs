
pub fn dir8_x(n: i32) -> i32 {
    if n == 0 || n == 4 || n == 6 {
        -1
    } else if n == 1 || n == 5 || n == 7 {
        1
    } else {
        0
    }
}
