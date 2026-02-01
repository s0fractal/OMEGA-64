pub fn become<M>(actor: &mut Actor<M>, new_behavior: Box<dyn Fn(M)>) {
    actor.receive = new_behavior;
}
