pub fn map<F, L, T, U>(f: F, l: L) -> Vec<U>
where
    F: Fn(T) -> U,
    L: IntoIterator<Item = T>,
{
    l.into_iter().map(f).collect()
}
