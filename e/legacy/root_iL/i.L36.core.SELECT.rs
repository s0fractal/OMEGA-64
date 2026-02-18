pub fn select<T, F>(rel: Relation<T>, predicate: F) -> Relation<T>
where
    F: Fn(&T) -> bool,
{
    Relation {
        rows: rel.rows.into_iter().filter(predicate).collect(),
    }
}
