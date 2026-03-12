
// Mocking types for independent compilation

use crate::core::tick::Tick;

pub struct Chronos {
    pub history: Vec<String>, // Log of past moments
}

pub struct Momentum {
    pub value: f64, // Inertia of the current intent (0.0 to 1.0)
}

pub struct Flow {
    pub continuity_index: f64, // Smoothness of transition
}

impl Chronos {
    pub fn new() -> Self {
        Chronos { history: Vec::new() }
    }

    pub fn record(&mut self, event: &str, tick: &Tick) {
        let entry = format!("[T{}] {}", tick.id, event);
        self.history.push(entry);
    }
}

impl Momentum {
    pub fn new() -> Self {
        Momentum { value: 0.0 }
    }

    /// Decay momentum over time if not sustained
    pub fn decay(&mut self) {
        self.value *= 0.95; 
    }

    /// Boost momentum over time if sustained
    pub fn boost(&mut self) {
        self.value = (self.value + 0.1).min(1.0);
    }
}
