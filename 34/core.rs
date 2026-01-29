// 🛡️ Level 28 Logic (Metallic: Multiparadigm Projections)

/**
 * ACTOR: An independent computing entity.
 */
pub struct Actor<M> {
    pub receive: Box<dyn Fn(M)>,
}

/**
 * SEND: Transmission of message to an actor.
 */
pub fn send<M>(target: &Actor<M>, msg: M) {
    (target.receive)(msg)
}

/**
 * BECOME: Changing the internal behavior of an actor.
 */
pub fn become<M>(actor: &mut Actor<M>, new_behavior: Box<dyn Fn(M)>) {
    actor.receive = new_behavior;
}

// Atoms for this level are transfused. (lvl: 28)
