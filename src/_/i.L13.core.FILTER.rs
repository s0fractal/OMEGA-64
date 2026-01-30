pub fn filter<P, L, T>(p: P, l: L) -> Vec<T>
where
    P: Fn(&T) -> bool,
    L: IntoIterator<Item = T>,
{
    l.into_iter().filter(p).collect()
}
