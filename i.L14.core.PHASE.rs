
// Mocking types for independent compilation
// @spectral: PHASE::lambda:t->t

pub struct Phase {
    pub t: f64, // Temporal offset (Radians)
}

impl Phase {
    pub fn new(t: f64) -> Self {
        Phase { t }
    }

    /// Створює часовий зсув для хвилі
    pub fn shift(&mut self, offset: f64) {
        // Обмеження фази циклом 2π (360°)
        self.t = (self.t + offset) % (2.0 * std::f64::consts::PI);
    }
}

pub struct Wave {
    pub vibration: f64, // λv (L15)
    pub frequency: f64, // λf (L15)
    // Note: Amplitude and Phase might be integrated differently in full system
}

impl Wave {
    pub fn new(vibration: f64, frequency: f64) -> Self {
        Wave { vibration, frequency }
    }
}
