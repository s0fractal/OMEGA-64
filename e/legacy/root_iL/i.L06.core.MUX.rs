pub fn mux<B, T>(b: B, x: T, y: T) -> T
where
    B: Fn(T, T) -> T,
{
    b(x, y)
}
