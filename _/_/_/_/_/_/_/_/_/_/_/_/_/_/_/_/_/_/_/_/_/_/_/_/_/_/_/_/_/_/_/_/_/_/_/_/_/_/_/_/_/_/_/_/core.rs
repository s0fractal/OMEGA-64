// 🛡️ Level 45 Logic (Metallic: Flow Control)

/**
 * STATE: A computation with state effects.
 * s -> (a, s)
 */
pub struct State<S, A> {
    pub run: Box<dyn Fn(S) -> (A, S)>,
}

/**
 * READER: A computation with read-only environment.
 * r -> a
 */
pub struct Reader<R, A> {
    pub ask: Box<dyn Fn(R) -> A>,
}

// Atoms for this level are transfused. (lvl: 45)
