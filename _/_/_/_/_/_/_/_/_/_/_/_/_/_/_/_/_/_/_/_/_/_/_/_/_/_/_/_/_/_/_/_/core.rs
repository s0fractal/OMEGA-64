// 🛡️ Level 36 Logic (Metallic: Flow Control)

pub struct Lens<S, A> {
    pub get: Box<dyn Fn(&S) -> A>,
    pub set: Box<dyn Fn(&S, A) -> S>,
}

impl<S, A> Lens<S, A> {
    pub fn view(&self, s: &S) -> A {
        (self.get)(s)
    }
    
    pub fn over<F>(&self, s: &S, f: F) -> S 
    where F: Fn(A) -> A {
        let a = (self.get)(s);
        (self.set)(s, f(a))
    }
}

// Atoms for this level are transfused. (lvl: 36)
