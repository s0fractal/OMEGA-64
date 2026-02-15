
// Mocking types for independent compilation
// @spectral: PRESSURE::lambda:p->p

pub struct Pressure {
    pub value: f64, // Extrinsic Force / Area
}

pub struct Stress {
    pub value: f64, // Intrinsic Reaction Force / Area
    pub limit: f64, // Material Yield Strength
}

pub struct Tension {
    pub value: f64, // Pulling Force
}

pub struct MaterialState {
    pub current_stress: Stress,
    pub integrity: f64, // 0.0 to 1.0
}

impl MaterialState {
    pub fn new(yield_limit: f64) -> Self {
        MaterialState {
            current_stress: Stress { value: 0.0, limit: yield_limit },
            integrity: 1.0,
        }
    }

    /// Apply external pressure to the material
    pub fn apply_pressure(&mut self, pressure: &Pressure) {
        // Simple model: Stress increases with Pressure
        self.current_stress.value += pressure.value;
        
        // If stress exceeds limit, integrity degrades
        if self.current_stress.value > self.current_stress.limit {
            let overflow = self.current_stress.value - self.current_stress.limit;
            // Decay integrity exponentially based on overflow
            self.integrity *= (-overflow / 100.0).exp(); 
        }
    }

    /// Relax the system (reduce stress over time or via redistribution)
    pub fn relax(&mut self, rate: f64) {
        self.current_stress.value = (self.current_stress.value - rate).max(0.0);
    }
}
