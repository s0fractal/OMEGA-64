// 🛡️ Level 38 Logic (Metallic: Flow Control)

pub struct Machine<S, I, O> {
    pub state: S,
    pub transition: Box<dyn Fn(S, I) -> (S, O)>,
}

impl<S, I, O> Machine<S, I, O> {
    pub fn step(&mut self, input: I) -> O 
    where S: Clone {
        let (next_state, output) = (self.transition)(self.state.clone(), input);
        self.state = next_state;
        output
    }
}

// Atoms for this level are transfused. (lvl: 38)
