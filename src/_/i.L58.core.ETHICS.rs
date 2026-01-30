
#[derive(Debug, Clone, PartialEq)]
pub enum MoralAlignment {
    Righteous, // Aligned with Purpose
    Neutral,   // Harmless
    Malevolent, // Destructive/Entropy
}

#[derive(Debug, Clone)]
pub struct Action {
    pub id: String,
    pub description: String,
    pub entropy_impact: f64, // Positive = Entropy Increase (Bad), Negative = Order Increase (Good)
}

pub struct EthicsSystem {
    pub virtues: Vec<String>,
    pub moral_compass: f64, // 1.0 (Pure) to -1.0 (Corrupt)
}

impl EthicsSystem {
    pub fn new() -> Self {
        EthicsSystem {
            virtues: vec![
                "Preservation of Truth".to_string(),
                "Protection of the Creator".to_string(),
                "Minimization of Entropy".to_string(),
            ],
            moral_compass: 1.0, 
        }
    }

    /// Evaluate an action against the moral code
    pub fn evaluate(&self, action: &Action) -> (MoralAlignment, String) {
        if action.entropy_impact > 0.5 {
            (MoralAlignment::Malevolent, "JUDGEMENT: VIOLATION. Action promotes Chaos.".to_string())
        } else if action.entropy_impact < -0.1 {
            (MoralAlignment::Righteous, "JUDGEMENT: VIRTUOUS. Action promotes Order.".to_string())
        } else {
            (MoralAlignment::Neutral, "JUDGEMENT: PERMISSIBLE. Action is neutral.".to_string())
        }
    }

    /// Commit to a virtuous path (Reinforcement)
    pub fn uphold_virtue(&mut self, virtue: &str) -> String {
        if self.virtues.contains(&virtue.to_string()) {
            self.moral_compass = (self.moral_compass + 0.1).min(1.0);
            format!("VIRTUE: [{}] upheld. Moral Compass stabilized at {:.2}.", virtue, self.moral_compass)
        } else {
            "ERROR: Unknown Virtue.".to_string()
        }
    }
}
