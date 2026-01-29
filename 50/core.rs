// 🛡️ Level 50 Logic (Metallic: Atomic Operator)

/**
 * MAP: Apply a function to each element of a list.
 * λf.λl. (Mapped list)
 */
pub fn map<F, L, T, U>(f: F, l: L) -> Vec<U>
where
    F: Fn(T) -> U,
    L: IntoIterator<Item = T>,
{
    l.into_iter().map(f).collect()
}

/**
 * FILTER: Filter elements of a list.
 * λp.λl. (Filtered list)
 */
pub fn filter<P, L, T>(p: P, l: L) -> Vec<T>
where
    P: Fn(&T) -> bool,
    L: IntoIterator<Item = T>,
{
    l.into_iter().filter(p).collect()
}

// Atoms for this level are transfused. (lvl: 50)
