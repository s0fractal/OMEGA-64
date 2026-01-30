
// Mocking types for independent compilation

pub struct Void {
    pub capacity: f64, // How much nothingness fits here
    pub entropy_level: f64, // Accumulated trapped entropy
}

pub struct Vacuum {
    pub suction_power: f64, // Pressure differential (Negative)
}

impl Void {
    pub fn new(capacity: f64) -> Self {
        Void {
            capacity,
            entropy_level: 0.0,
        }
    }

    /// Absorb entropy from a source
    pub fn absorb(&mut self, amount: f64) -> f64 {
        let available_space = self.capacity - self.entropy_level;
        let absorbed = amount.min(available_space);
        self.entropy_level += absorbed;
        absorbed // Return actual amount absorbed
    }
}

impl Vacuum {
    pub fn new(power: f64) -> Self {
        Vacuum { suction_power: power }
    }

    /// Create suction effect based on pressure differential
    pub fn pull(&self, surrounding_pressure: f64) -> f64 {
        // Suction is effective when surrounding pressure is high relative to the void
        // Basic physics: Flow = Delta P
        let differential = surrounding_pressure + self.suction_power; // power is conceptually negative or additive suction
        if differential > 0.0 {
            differential * 0.5 // Efficiency factor
        } else {
            0.0
        }
    }
}
