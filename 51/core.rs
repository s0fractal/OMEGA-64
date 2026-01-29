// 🛡️ Level 51 Logic (Metallic: Atomic Operator)

/**
 * TRIPLE: Three-element container
 * λx.λy.λz.λf. f x y z
 */
pub fn triple<T, U, V, F, R>(x: T, y: U, z: V) -> Box<dyn Fn(F) -> R>
where
    T: Clone + 'static,
    U: Clone + 'static,
    V: Clone + 'static,
    F: Fn(T, U, V) -> R + 'static,
{
    Box::new(move |f: F| f(x.clone(), y.clone(), z.clone()))
}

/**
 * T1: First element of a triple
 */
pub fn t1<P, T, U, V>(p: P) -> T
where
    P: Fn(Box<dyn Fn(T, U, V) -> T>) -> T,
{
    p(Box::new(|x: T, _y: U, _z: V| x))
}

// Atoms for this level are transfused. (lvl: 51)
