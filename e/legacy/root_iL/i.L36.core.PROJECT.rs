pub fn project<T, U, F>(rel: Relation<T>, transform: F) -> Relation<U>
where
    F: Fn(T) -> U,
{
    Relation {
        rows: rel.rows.into_iter().map(transform).collect(),
    }
}
