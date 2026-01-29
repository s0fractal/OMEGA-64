// 🛡️ Level 59 Logic (Metallic: Atomic Operator)

/**
 * T: True (Isomorphic to K)
 * λt.λf. t
 */
pub fn t<T, U>(t_val: T, _f_val: U) -> T {
    t_val
}

/**
 * F: False (Isomorphic to KI)
 * λt.λf. f
 */
pub fn f<T, U>(_t_val: T, f_val: U) -> U {
    f_val
}

/**
 * NOT: Logical negation
 * λb. b F T
 */
pub fn not<F, T, U>(b: F, t_val: T, f_val: U) -> U 
where 
    F: Fn(U, T) -> U
{
    b(f_val, t_val)
}

// Atoms for this level are transfused. (lvl: 59)
