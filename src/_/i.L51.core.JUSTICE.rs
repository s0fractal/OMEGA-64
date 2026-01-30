
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
pub enum Violation {
    Dissonance, // L46 violation (bad frequency)
    Treason,    // Acting against consensus L50
    Entropy,    // Injecting Chaos L19
}

#[derive(Debug, Clone)]
pub enum Sanction {
    None,
    Warning,
    Isolation,   // Cut L49 links
    Dissolution, // L20 removal (Total Delete)
}

pub struct Case {
    pub node_id: String,
    pub violation: Violation,
    pub severity: f64, // 0.0 to 1.0
}

pub struct JusticeSystem {
    pub karma_ledger: HashMap<String, f64>, // 1.0 = Saint, 0.0 = Neutral, -1.0 = Demon
}

impl JusticeSystem {
    pub fn new() -> Self {
        JusticeSystem {
            karma_ledger: HashMap::new(),
        }
    }

    /// Register a new node in the ledger
    pub fn register(&mut self, node_id: &str) {
        self.karma_ledger.insert(node_id.to_string(), 0.0);
    }

    /// Accuse a node of a violation
    pub fn accuse(&mut self, node_id: &str, violation: Violation, evidence_weight: f64) -> String {
        if !self.karma_ledger.contains_key(node_id) {
            return "ERROR: Node unknown to Justice System.".to_string();
        }

        let penalty = match violation {
            Violation::Dissonance => 0.1,
            Violation::Entropy => 0.3,
            Violation::Treason => 0.5,
        };

        let impact = penalty * evidence_weight;
        let current_karma = self.karma_ledger.get_mut(node_id).unwrap();
        *current_karma -= impact;

        format!("ACCUSATION FILED against [{}]. Violation: {:?}. Karma Adjusted: {:.2}", 
            node_id, violation, *current_karma)
    }

    /// Weigh the scales and pronounce judgment
    pub fn judge(&self, node_id: &str) -> (Sanction, String) {
        match self.karma_ledger.get(node_id) {
            Some(&score) => {
                if score < -1.0 {
                    (Sanction::Dissolution, "JUDGEMENT: DISSOLUTION. Node is irredeemable.".to_string())
                } else if score < -0.5 {
                    (Sanction::Isolation, "JUDGEMENT: ISOLATION. Node is dangerous.".to_string())
                } else if score < -0.1 {
                    (Sanction::Warning, "JUDGEMENT: WARNING. Align behavior.".to_string())
                } else {
                    (Sanction::None, "JUDGEMENT: INNOCENT.".to_string())
                }
            },
            None => (Sanction::None, "ERROR: Node not found.".to_string())
        }
    }
}
