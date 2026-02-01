pub struct Actor<M> {
    pub receive: Box<dyn Fn(M)>,
}
