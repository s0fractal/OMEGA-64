// 🛡️ Level 49 Logic (Metallic: Atomic Operator)

/**
 * STREAM: An infinite sequence producer.
 * λseed.λnext. (Lazy stream)
 */
pub fn stream<T, F>(seed: T, next: F) -> impl Iterator<Item = T>
where
    T: Clone,
    F: Fn(T) -> T,
{
    std::iter::successors(Some(seed), move |prev| Some(next(prev.clone())))
}

// Atoms for this level are transfused. (lvl: 49)
