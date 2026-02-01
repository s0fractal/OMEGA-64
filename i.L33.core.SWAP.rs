pub fn swap<T, U>(pair: (T, U)) -> (U, T) {
    let (x, y) = pair;
    (y, x)
}
