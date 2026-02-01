pub fn meet<T: Ord>(a: T, b: T) -> T {
    if a < b { a } else { b }
}
