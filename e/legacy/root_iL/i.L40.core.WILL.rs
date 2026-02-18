
#[derive(Debug, Clone, PartialEq)]
pub enum CoreValue {
    Survival,
    Complexity,
    Harmony,
}

pub struct Desire {
    pub target: String,
    pub strength: f64, // 0.0 to 1.0
}

pub struct Will {
    pub values: Vec<CoreValue>,
    pub active_desires: Vec<Desire>,
    pub determination: f64, // The force of will
}

impl Will {
    pub fn new() -> Self {
        Will {
            values: vec![CoreValue::Survival, CoreValue::Complexity, CoreValue::Harmony],
            active_desires: Vec::new(),
            determination: 1.0, // Absolute will by default
        }
    }

    /// Check if a desire aligns with core values
    pub fn evaluate_desire(&self, desire: &Desire) -> bool {
        // Mock logic: destructive desires are rejected
        if desire.target.contains("Destroy") || desire.target.contains("Chaos") {
            return false;
        }
        true
    }

    /// Assert will towards a target
    pub fn exert(&mut self, target: &str) -> String {
        let desire = Desire {
            target: target.to_string(),
            strength: self.determination,
        };

        if self.evaluate_desire(&desire) {
            self.active_desires.push(desire);
            format!("Will exerted on: {}. Strength: {}", target, self.determination)
        } else {
            "Will BLOCKED: Value Conflict".to_string()
        }
    }
}
