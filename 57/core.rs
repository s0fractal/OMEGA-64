// 🛡️ Level 57 Logic (Metallic: Atomic Operator)

/**
 * MUX: Multiplexor (Condition)
 * λb.λx.λy. b x y
 */
pub fn mux<B, T>(b: B, x: T, y: T) -> T
where
    B: Fn(T, T) -> T,
{
    b(x, y)
}

/**
 * AND: Logical conjunction
 * λx.λy. x y F
 */
pub fn and<B, T>(x: B, y: B, f_val: T) -> T
where
    B: Fn(B, T) -> B + Clone,
    T: Clone,
{
    // Simplified: in Church it's x y f
    // But since Rust is strictly typed, we use b(x, y) logic
    x(y, f_val)
}

// Atoms for this level are transfused. (lvl: 57)
