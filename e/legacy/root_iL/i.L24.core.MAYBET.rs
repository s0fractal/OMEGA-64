pub struct MaybeT<M, A> {
    pub inner: M, // Expected to wrap Option<A>
}
