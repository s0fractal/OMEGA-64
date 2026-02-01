pub fn and<B, T>(x: B, y: B, f_val: T) -> T
where
    B: Fn(B, T) -> B + Clone,
    T: Clone,
{
    // Simplified: in Church it's x y f
    // But since Rust is strictly typed, we use b(x, y) logic
    x(y, f_val)
}
