pub fn send<M>(target: &Actor<M>, msg: M) {
    (target.receive)(msg)
}
