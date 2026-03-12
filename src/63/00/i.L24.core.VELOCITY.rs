
// Mocking types for independent compilation

use crate::core::tick::Tick;

pub struct Velocity {
    pub value: f64, // Intent change per tick
}

pub struct Acceleration {
    pub value: f64, // Velocity change per tick
}

pub struct Tempo {
    pub dilation: f64, // 1.0 = Normal, 2.0 = Overclock, 0.5 = Bullet Time
}

impl Tempo {
    pub fn new(dilation: f64) -> Self {
        Tempo { dilation }
    }

    /// Calculate effective ticks based on tempo
    /// e.g., if Tempo is 2.0, 10 real ticks = 20 effective ticks of processing
    pub fn dilate(&self, raw_ticks: u64) -> f64 {
        raw_ticks as f64 * self.dilation
    }
}
