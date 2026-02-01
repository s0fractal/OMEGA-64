pub struct Cont<A, R> {
    pub run: Box<dyn Fn(Box<dyn Fn(A) -> R>) -> R>,
}
