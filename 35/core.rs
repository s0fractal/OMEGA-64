// 🛡️ Level 39 Logic (Metallic: Flow Control)

pub trait Lattice<T> {
    fn join(a: T, b: T) -> T;
    fn meet(a: T, b: T) -> T;
}

/**
 * JOIN: Supremum of two elements.
 */
pub fn join<T: Ord>(a: T, b: T) -> T {
    if a > b { a } else { b }
}

/**
 * MEET: Infimum of two elements.
 */
pub fn meet<T: Ord>(a: T, b: T) -> T {
    if a < b { a } else { b }
}

// Atoms for this level are transfused. (lvl: 39)
