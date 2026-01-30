pub fn succ<N, F, T, U>(n: N, f: F, x: T) -> U
where
    N: Fn(F, T) -> T,
    F: Fn(T) -> U + Clone,
    T: Clone,
    U: From<T>, // Simplified for Rust types
{
    f.clone()(n(f, x))
}
