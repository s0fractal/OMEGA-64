pub fn stream<T, F>(seed: T, next: F) -> impl Iterator<Item = T>
where
    T: Clone,
    F: Fn(T) -> T,
{
    std::iter::successors(Some(seed), move |prev| Some(next(prev.clone())))
}
