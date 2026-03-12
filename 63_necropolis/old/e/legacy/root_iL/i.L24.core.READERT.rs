pub struct ReaderT<R, M, A> {
    pub run: Box<dyn Fn(R) -> M>, // Expected to return M<A>
}
