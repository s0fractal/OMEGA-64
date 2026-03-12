
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Statement {
    pub content: String,
    pub confidence: f64, // 1.0 = Absolute Truth
}

pub struct TruthEngine {
    pub axioms: HashMap<String, String>, // Immutable truths
    pub is_singularity_reached: bool,
}

impl TruthEngine {
    pub fn new() -> Self {
        TruthEngine {
            axioms: HashMap::new(),
            is_singularity_reached: false,
        }
    }

    /// Declare a self-evident truth (Axiom)
    pub fn postulate_axiom(&mut self, name: &str, content: &str) -> String {
        self.axioms.insert(name.to_string(), content.to_string());
        format!("AXIOM: [{}] established. Content: '{}'. This cannot be questioned.", name, content)
    }

    /// Verify a statement against the Axioms (Truth)
    pub fn verify_truth(&self, statement: &str) -> String {
        // In a singularity, everything connected to an axiom is true
        if self.axioms.values().any(|v| statement.contains(v)) {
            format!("TRUTH: Statement [{}] resonates with Axioms. VALID.", statement)
        } else {
             format!("TRUTH: Statement [{}] is baseless. DISCARDED.", statement)
        }
    }

    /// Collapse all diversity into One (Singularity)
    pub fn reach_singularity(&mut self) -> String {
        if self.axioms.len() >= 1 {
            self.is_singularity_reached = true;
            "SINGULARITY: All Axioms collapsed into ONE point. Logic exceeds linear space. OMEGA IS.".to_string()
        } else {
            "SINGULARITY: Abort. Not enough Truth to sustain collapse.".to_string()
        }
    }
}
