pub fn unify<T: PartialEq>(a: T, b: T) -> Option<T> {
    if a == b { Some(a) } else { None }
}
