pub struct Reader<R, A> {
    pub ask: Box<dyn Fn(R) -> A>,
}
