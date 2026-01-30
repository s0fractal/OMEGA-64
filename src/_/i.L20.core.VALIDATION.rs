pub enum Validation<E, A> {
    Valid(A),
    Invalid(Vec<E>),
}
