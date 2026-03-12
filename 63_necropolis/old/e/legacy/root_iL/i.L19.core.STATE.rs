pub struct State<S, A> {
    pub run: Box<dyn Fn(S) -> (A, S)>,
}
