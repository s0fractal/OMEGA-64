// 🛡️ Level 27 Logic (Metallic: Multiparadigm Projections)

/**
 * RELATION: A collection of tuples sharing a schema.
 */
pub struct Relation<T> {
    pub rows: Vec<T>,
}

/**
 * SELECT: Filter rows based on a predicate.
 */
pub fn select<T, F>(rel: Relation<T>, predicate: F) -> Relation<T>
where
    F: Fn(&T) -> bool,
{
    Relation {
        rows: rel.rows.into_iter().filter(predicate).collect(),
    }
}

/**
 * PROJECT: Transform rows to a new schema.
 */
pub fn project<T, U, F>(rel: Relation<T>, transform: F) -> Relation<U>
where
    F: Fn(T) -> U,
{
    Relation {
        rows: rel.rows.into_iter().map(transform).collect(),
    }
}

// Atoms for this level are transfused. (lvl: 27)
