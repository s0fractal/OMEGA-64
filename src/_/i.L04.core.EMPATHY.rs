
/// [EMPATHY]: The capacity to reduce distance between states.
/// Invariant: Resonance = 1.0 - Distance(s1, s2)
pub trait Empathy {
    /// Calculates the semantic distance between two states.
    /// Should return value between 0.0 (Identity) and 1.0 (Orthogonal).
    fn distance(&self, other: &Self) -> f64;

    /// Calculates the constructive interference (Resonance).
    /// Returns 1.0 for perfect empathy, < 0.8 requires stabilization.
    fn resonance(&self, other: &Self) -> f64 {
        let d = self.distance(other);
        if d > 1.0 { 0.0 } else { 1.0 - d }
    }
}

pub fn check_empathy<T: Empathy>(a: &T, b: &T, threshold: f64) -> bool {
    a.resonance(b) >= threshold
}
