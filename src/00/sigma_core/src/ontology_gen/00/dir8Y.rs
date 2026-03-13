
pub fn dir8Y(n: i32) -> i32 {
    if n == 2 || n == 4 || n == 5 {
        -1
    } else if n == 3 || n == 6 || n == 7 {
        1
    } else {
        0
    }
}
