// 🛡️ Level 61 Logic (Metallic: Axiomatic Root)

/**
 * S: Substitution Combinator
 * λx.λy.λz. x z (y z)
 */
pub fn s<F, G, T, U, V>(x: F, y: G, z: T) -> V
where
    F: Fn(T) -> Box<dyn Fn(U) -> V>,
    G: Fn(T) -> U,
    T: Clone,
{
    (x(z.clone()))(y(z))
}

pub const SUBSTITUTION: &str = "λx.λy.λz.xz(yz)";

// Atoms for this level are transfused. (lvl: 61)
