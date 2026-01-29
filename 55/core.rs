// 🛡️ Level 54 Logic (Metallic: Atomic Operator)

/**
 * CONS: Pair Constructor
 * λx.λy.λf. f x y
 */
pub fn cons<T, U, F, V>(x: T, y: U) -> Box<dyn Fn(F) -> V>
where
    T: Clone + 'static,
    U: Clone + 'static,
    F: Fn(T, U) -> V + 'static,
{
    Box::new(move |f: F| f(x.clone(), y.clone()))
}

/**
 * CAR: First element of a pair
 * λp. p (λx.λy. x)
 */
pub fn car<P, T, U>(p: P) -> T
where
    P: Fn(Box<dyn Fn(T, U) -> T>) -> T,
{
    p(Box::new(|x: T, _y: U| x))
}

/**
 * CDR: Second element of a pair
 * λp. p (λx.λy. y)
 */
pub fn cdr<P, T, U>(p: P) -> U
where
    P: Fn(Box<dyn Fn(T, U) -> U>) -> U,
{
    p(Box::new(|_x: T, y: U| y))
}

// Atoms for this level are transfused. (lvl: 54)
