
// Mocking types for independent compilation

pub struct Volume {
    pub value: f64, // Space occupied
}

pub struct Density {
    pub value: f64, // Mass / Volume
}

impl Density {
    pub fn new(mass: f64, volume: f64) -> Self {
        Density {
            value: mass / volume,
        }
    }

    /// Hardens the density in response to pressure
    /// Increases yield strength of the material
    pub fn harden(&mut self, pressure_ratio: f64) {
        // If pressure is high (ratio > 1.0), density increases to compensate
        // Simulating compression of the lattice
        if pressure_ratio > 1.0 {
            self.value *= pressure_ratio; 
        }
    }
}
