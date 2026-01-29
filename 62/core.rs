// 🛡️ Level 62 Logic (Metallic: Axiomatic Root)

/**
 * K: Constant Combinator
 * λx.λy. x
 */
pub fn k<T, U>(x: T) -> Box<dyn Fn(U) -> T + Send + Sync> 
where 
    T: Clone + 'static + Send + Sync,
    U: 'static 
{
    Box::new(move |_y: U| x.clone())
}

pub const CONSTANT: &str = "λx.λy.x";

// Atoms for this level are transfused. (lvl: 62)
