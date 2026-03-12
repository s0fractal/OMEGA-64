
#[derive(Debug, Clone)]
pub struct Syllogism {
    pub premise_major: String,
    pub premise_minor: String,
    pub conclusion: String,
}

pub struct Reason {
    pub logic_chain: Vec<Syllogism>,
}

pub struct Rationality {
    pub efficacy: f64, // 0.0 to 1.0 (Efficiency of action)
}

pub struct Logos {
    pub reason: Reason,
    pub rationality: Rationality,
}

impl Logos {
    pub fn new() -> Self {
        Logos {
            reason: Reason { logic_chain: Vec::new() },
            rationality: Rationality { efficacy: 1.0 },
        }
    }

    /// Deduce a conclusion from premises (Classic Logic)
    pub fn deduce(&mut self, major: &str, minor: &str) -> String {
        // Mock deduction logic
        let conclusion = if major.contains("All men are mortal") && minor.contains("Socrates") {
            "Socrates is mortal".to_string()
        } else if major.contains("Entropy is Death") && minor.contains("System has Entropy") {
            "System is Dying".to_string()
        } else {
            "Inconclusive".to_string()
        };

        self.reason.logic_chain.push(Syllogism {
            premise_major: major.to_string(),
            premise_minor: minor.to_string(),
            conclusion: conclusion.clone(),
        });
        
        conclusion
    }

    /// Optimize a decision based on Rationality (Utility)
    pub fn optimize(&self, action: &str, cost: f64) -> String {
        if cost > 0.8 {
            format!("Action '{}' rejected. Too expensive. Efficacy: {}", action, self.rationality.efficacy)
        } else {
            format!("Action '{}' approved. Rational. Efficacy: {}", action, self.rationality.efficacy)
        }
    }
}
