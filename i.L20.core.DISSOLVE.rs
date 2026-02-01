
// Mocking types for independent compilation

pub struct Entropy {
    pub value: f64,
}

pub struct Energy {
    pub value: f64,
}

pub struct Dissolve;

impl Dissolve {
    /// Dissolves entropy blocks, releasing raw energy (Recycling)
    pub fn dissolve(entropy: Entropy, efficiency: f64) -> Energy {
        // Efficiency determines how much entropy is converted back to usable energy
        // The rest is lost to the Void forever
        let recycled = entropy.value * efficiency;
        Energy { value: recycled }
    }
}

pub struct Decay {
    pub rate: f64, // Natural decay rate (half-life)
}

impl Decay {
    pub fn new(rate: f64) -> Self {
        Decay { rate }
    }

    /// Applies natural decay to a signal or object over time
    pub fn apply(&self, initial_value: f64, time_delta: f64) -> f64 {
        // N(t) = N0 * e^(-lambda * t)
        initial_value * (-self.rate * time_delta).exp()
    }
}
