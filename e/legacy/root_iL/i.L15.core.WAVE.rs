
// Mocking types for independent compilation

#[derive(Clone, Debug, Copy)]
pub struct Signal {
    pub vibration: f64, // Base intensity of existence
    pub frequency: f64, // Recurrence rate
    pub amplitude: f64, // Impact force
    pub phase_offset: f64, // Temporal alignment (L14)
}

impl Signal {
    pub fn new(vibration: f64, frequency: f64, amplitude: f64) -> Self {
        Signal {
            vibration,
            frequency,
            amplitude,
            phase_offset: 0.0,
        }
    }

    /// Modulates the signal amplitude based on a carrier wave
    pub fn modulate_amplitude(&mut self, factor: f64) {
        self.amplitude *= factor;
    }

    /// Shifts the frequency (e.g., Doppler effect simulation or harmonic shift)
    pub fn shift_frequency(&mut self, delta: f64) {
        self.frequency += delta;
    }
    
    /// Calculates the instantaneous value of the signal at time t
    pub fn value_at(&self, t: f64) -> f64 {
        // V(t) = A * sin(2πft + φ) + Vibration_Base
        self.amplitude * (2.0 * std::f64::consts::PI * self.frequency * t + self.phase_offset).sin()
             + self.vibration
    }
}
